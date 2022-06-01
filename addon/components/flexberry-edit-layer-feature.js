import { Promise, resolve, allSettled } from 'rsvp';
import { isArray, A } from '@ember/array';
import { isNone, isBlank, isEqual } from '@ember/utils';
import {
  computed, observer, get, set
} from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from 'ember-i18n';
import layout from '../templates/components/flexberry-edit-layer-feature';
import SnapDrawMixin from '../mixins/snap-draw';
import EditFeatureMixin from '../mixins/edit-feature';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';

export default Component.extend(SnapDrawMixin, LeafletZoomToFeatureMixin, EditFeatureMixin, {
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: service(),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Component's additional CSS-class names.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Placeholder for dataPicker.

    @property placeholderDataPicker
    @type String
    @default null
  */
  placeholderDataPicker: null,

  loading: false,

  block: false,

  activeGeoTool: null,

  panToAddedObject: true,

  _attributesExpanded: true,

  rhumbMode: true,

  drawMode: true,

  geoproviderMode: true,

  /**
    Edit|Create|Union|Split|Diff|Import
  */
  mode: null,

  state: computed('mode', function () {
    const mode = this.get('mode');

    if (mode === 'Union' || mode === 'Split' || mode === 'Diff' || mode === 'Import' || mode === 'Create') {
      return 'New';
    }

    if (mode === 'Edit') {
      return 'Edit';
    }

    return null;
  }),

  curIndex: null,

  /**
    Editing object properties

    @property data
    @type Object
    @default null
  */
  data: null,

  /**
    Edited leaflet layer (geometry)
    @property layer
    @type object
    @default null
  */
  layers: null,

  /**
    Copy of leaflet layer latlngs
    @property object
    @default null
  */
  latlngs: null,

  /**
    Edited item
    @property itemForEdit
    @type Object (layer, data, initialdata, key)
    @default null
  */
  dataItems: null,

  isFavorite: false,

  dataItemCount: computed('dataItems', function () {
    const items = this.get('dataItems.items');
    if (isNone(items)) {
      return 0;
    }

    return items.length;
  }),

  _dataItemObserver: observer('dataItems', function () {
    const leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.tools.enable('drag');

    this.set('error', null);

    // Уберем редактирование с объектов, если оно было
    const layers = this.get('layers');
    if (layers) {
      Object.values(layers).filter((layer) => !isNone(layer)).forEach((layer) => {
        const enabled = get(layer, 'editor._enabled');
        if (enabled) {
          layer.disableEdit();
        }

        leafletMap.off('editable:vertex:dragstart', this._startSnapping, this);

        layer.off('editable:vertex:dragend', this._updateLabels, [this, layer]);
        layer.off('editable:vertex:deleted', this._updateLabels, [this, layer]);
      });
    }

    this.set('activeGeoTool', 'manual');

    let index = 1;
    const dataItems = this.get('dataItems');
    if (dataItems) {
      this.set('curIndex', 1);
      this.set('latlngs', {});
      this.set('layers', {});
      this.set('data', {});
      this.set('initialData', {});
      this.set('mode', dataItems.mode);

      this.set('choiceValueData', dataItems.choiceValueData); // эта штука должна быть только одна

      const editTools = this._getEditTools();
      set(leafletMap, 'editTools', editTools);

      dataItems.items.forEach((dataItem) => {
        const { layer, } = dataItem;

        if (!isNone(layer)) {
          if (isNone(layer.feature.leafletLayer)) {
            set(layer.feature, 'leafletLayer', layer);
          }

          if (this.get('state') === 'Edit') {
            // сохраним геометрию, чтобы можно было быстро к ней вернуться при отмене
            let latlngs;
            switch (layer.feature.geometry.type) {
              case 'Point':
                latlngs = layer.getLatLng();
                break;
              case 'LineString':
              case 'MultiLineString':
              case 'Polygon':
              case 'MultiPolygon':
                latlngs = layer.getLatLngs();
                break;
              default:
            }

            const latlngcopy = {
              layer: this.copy(latlngs),
              label: null,
            };

            const label = get(layer, '_label');
            if (label) {
              latlngcopy.label = this.copy(label.getLatLng());
            }

            this.set(`latlngs.${index}`, latlngcopy);
          }

          const isMarker = layer instanceof L.Marker || layer instanceof L.CircleMarker;

          if (!leafletMap.hasLayer(layer)) {
            leafletMap.addLayer(layer);
          }

          this.send('zoomTo', [layer.feature]);
          this.send('clearSelected');
          if (!isMarker) {
            if (layer.bringToFront) {
              layer.bringToFront();
            }
          }

          layer.enableEdit(leafletMap);

          leafletMap.off('editable:vertex:dragstart', this._startSnapping, this);
          layer.off('editable:vertex:dragend', this._updateLabels, [this, layer]);
          layer.off('editable:vertex:deleted', this._updateLabels, [this, layer]);

          leafletMap.on('editable:vertex:dragstart', this._startSnapping, this);
          layer.on('editable:vertex:dragend', this._updateLabels, [this, layer]);
          layer.on('editable:vertex:deleted', this._updateLabels, [this, layer]);

          layer.off('editable:vertex:dragend', this._updateCoordinates, this);
          layer.off('editable:vertex:deleted', this._updateCoordinates, this);
          layer.off('editable:drawing:end', this._updateCoordinates, this);

          if (this.get('dataItemCount') > 1) {
            layer.on('editable:vertex:dragend', this.selectLayer, this);
            layer.on('editable:vertex:deleted', this.selectLayer, this);
            layer.on('editable:drawing:end', this.selectLayer, this);
          }
        }

        this.set(`layers.${index}`, layer);

        const { data, } = dataItem;
        this.set(`data.${index}`, data);
        this.set(`initialData.${index}`, Object.assign({}, data)); // копия объекта для быстрого восстановления

        index += 1;
      });

      if (this.get('dataItemCount') > 1) {
        this.selectLayer();
      }
    } else {
      this.cancelEdit(false);
    }
  }),

  /**
    Edited layer model
  */
  layerModel: null,

  /**
    leafletObject
  */
  leafletObject: null,

  setLeafletObject(leafletObject) {
    this.set('leafletObject', leafletObject);
  },

  _model: computed('layerModel', 'i18n.locale', function () {
    const layer = this.get('layerModel');

    if (isNone(layer)) {
      return {};
    }

    const settings = get(layer, 'settings') || {};

    const leafletObject = get(layer, 'leafletObject');
    this.setLeafletObject(leafletObject);
    const readonly = get(settings, 'readonly') || false;

    let availableDrawTools = null;
    let typeGeometry = null;

    if (!readonly) {
      const geometryFields = get(leafletObject, 'readFormat.featureType.geometryFields');
      availableDrawTools = this._getAvailableDrawTools(geometryFields);
      typeGeometry = this._getTypeGeometry(geometryFields);
    }

    const getHeader = () => {
      const result = {};
      const locale = this.get('i18n.locale');
      const localizedProperties = get(settings, `localizedProperties.${locale}`) || {};
      let excludedProperties = get(settings, 'excludedProperties');
      excludedProperties = isArray(excludedProperties) ? A(excludedProperties) : A();

      get(leafletObject, 'readFormat.featureType.fields').forEach((propertyName) => {
        if (!excludedProperties.includes(propertyName)) {
          const propertyCaption = get(localizedProperties, propertyName);
          result[propertyName] = !isBlank(propertyCaption) ? propertyCaption : propertyName;
        }
      });

      return result;
    };

    return {
      availableDrawTools,
      typeGeometry,
      name: get(layer, 'layerModel.name'),
      layerCRS: get(leafletObject, 'options.crs'),
      layerFields: get(leafletObject, 'readFormat.featureType.fields'),
      fieldTypes: get(leafletObject, 'readFormat.featureType.fieldTypes'),
      fieldParsers: get(leafletObject, 'readFormat.featureType.fields'),
      fieldValidators: get(leafletObject, 'readFormat.featureType.fieldValidators'),
      fieldNames: getHeader(),
    };
  }),

  /**
    Name of the selected group value.

    @property choiceValue
    @type Boolean
    @default null
  */
  choiceValue: null,

  /**
    List of groups value.

    @property choiceItems
    @type Object[]
    @default null
  */
  choiceItems: null,

  /**
    Array editing objects value.

    @property choiceValueData
    @type Object[]
    @default null
  */
  choiceValueData: null,

  /**
    Observes and handles changes in choiceValue.
    Сomputes editing object.

    @method choiceValueObserver
    @private
  */
  choiceValueObserver: observer('choiceValue', function () {
    const choiceValueData = this.get('choiceValueData');
    const choiceValue = this.get('choiceValue');
    const index = this.get('curIndex');
    this.set('data', {});
    if (!isNone(choiceValueData)) {
      if (!isNone(choiceValue) && !isBlank(choiceValue)) {
        this.set(`data.${index}`, choiceValueData[`${choiceValue}` - 1]);
      } else {
        this.set(`data.${index}`, choiceValueData[`${choiceValueData.length}` - 1]);
      }
    }
  }),

  /**
    Observes and handles changes in choiceValueData.
    Сomputes list 'choiceItems' name editing objects.

    @method choiceValueDataObserver
    @private
  */
  choiceValueDataObserver: observer('choiceValueData', function () {
    const choiceValueData = this.get('choiceValueData');
    if (!isNone(choiceValueData)) {
      const choice = Object.keys(choiceValueData).map((index) => Number(index) + 1);

      // adds empty template
      choice.push('');
      choiceValueData.push(this.get('data.1'));
      this.set('choiceItems', choice);
    } else {
      this.set('choiceItems', null);
      this.set('choiceValue', null);
    }
  }),

  /**
    Hash containing parsing errors related to field names.

    @property parsingErrors
    @type Object
    @default null
  */
  parsingErrors: null,

  /**
    Parses data.

    @method parseData
    @return {Object} Parsed data if it is valid or null.
  */
  parseData(index, data) {
    const fieldNames = this.get('_model.fieldNames');
    const fieldParsers = this.get('_model.fieldParsers');
    const fieldValidators = this.get('_model.fieldValidators');

    const parsingErrors = {};
    let dataIsValid = true;

    fieldNames.forEach((fieldName) => {
      if (!fieldNames.prototype.hasOwnProperty.call(fieldName)) {
        const text = get(data, fieldName);
        const value = fieldParsers[fieldName](text);
        const valueIsValid = fieldValidators[fieldName](value);

        if (valueIsValid) {
          set(data, fieldName, value);
        }

        dataIsValid = dataIsValid && valueIsValid;
        set(parsingErrors, fieldName, !valueIsValid);
      }
    });

    this.set(`parsingErrors.${index}`, parsingErrors);

    return dataIsValid ? data : null;
  },

  /**
  Copy layer latlngs

  @method copy
  @param {Leaflet Object} latlngs
  @returns {Leaflet Object} latlngs
*/
  copy(latlngs) {
    if (Array.isArray(latlngs)) {
      const latLngCopy = [];
      for (let i = 0; i < latlngs.length; i++) {
        latLngCopy.push(this.copy(latlngs[i]));
      }

      return latLngCopy;
    }

    const latlng = L.latLng(latlngs.lat, latlngs.lng);
    return latlng;
  },

  /**
    Returns the available drawing tools according to the type of layer geometry.

    @param {Object} geometryFields Hash with the layer geometry field names and their types.
  */
  _getAvailableDrawTools(geometryFields) {
    if (!isNone(geometryFields)) {
      const firstField = Object.keys(geometryFields)[0];
      switch (geometryFields[firstField]) {
        case 'PointPropertyType':
        case 'MultiPointPropertyType':
          return ['marker'];

        case 'LineStringPropertyType':
        case 'MultiLineStringPropertyType':
          return ['polyline'];

        case 'MultiSurfacePropertyType':
        case 'PolygonPropertyType':
        case 'MultiPolygonPropertyType':
          return ['rectangle', 'polygon'];
        default:
      }
    }

    return ['marker', 'circle', 'polyline', 'rectangle', 'polygon'];
  },

  /**
    Return geometry type.

    @param {Object} geometryFields Hash with the layer geometry field names and their types.
  */
  _getTypeGeometry(geometryFields) {
    if (!isNone(geometryFields)) {
      const firstField = Object.keys(geometryFields)[0];
      switch (geometryFields[firstField]) {
        case 'PointPropertyType':
        case 'MultiPointPropertyType':
          return 'marker';

        case 'LineStringPropertyType':
        case 'MultiLineStringPropertyType':
          return 'polyline';

        case 'MultiSurfacePropertyType':
        case 'PolygonPropertyType':
        case 'MultiPolygonPropertyType':
          return 'polygon';
        default:
      }
    }

    return 'all';
  },

  /**
    Initializes snapping for edited vertex.

    @method _startSnapping
    @param {Object} e Event object.
    @private
  */
  _startSnapping(e) {
    if (e.layer instanceof L.Rectangle || e.layer instanceof L.Circle) {
      return;
    }

    let tabLayer = e.layer._eventParents || {};
    tabLayer = tabLayer[Object.keys(tabLayer)[0]];
    if (!tabLayer) {
      return;
    }

    this.set('_snapLayers', tabLayer.getLayers().filter((layer) => layer !== e.layer));
    const leafletMap = this.get('leafletMap');

    leafletMap.off('editable:vertex:drag', this._handleSnapping, this);
    leafletMap.on('editable:vertex:drag', this._handleSnapping, this);

    leafletMap.off('editable:vertex:dragend', this._cleanupSnapping, this);
    leafletMap.on('editable:vertex:dragend', this._cleanupSnapping, this);
  },

  _snapLeafletLayers: computed('_snapLayers', function () {
    return this.get('_snapLayers');
  }),

  mapObserver: observer('leafletMap', function () {
    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      leafletMap.on('flexberry-map:delete-feature:start', this._onDelete, this);
    }
  }),

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    const leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.off('flexberry-map:delete-feature:start', this._onDelete, this);
    }
  },

  _onDelete(e) {
    const datas = this.get('initialData');
    const layers = this.get('layers');
    if (isNone(datas) || isNone(layers)) {
      return;
    }

    if (isNone(e.ids)) {
      return;
    }

    const mapModelApi = this.get('mapApi').getFromApi('mapModel');
    const pkField = mapModelApi._getPkField(this.get('layerModel.layerModel'));
    let needCancel = false;

    Object.keys(datas).forEach((key) => {
      const data = datas[key];
      const layer = layers[key];

      let id;
      if (data.property.hasOwnProperty.call(pkField)) {
        id = get(data, pkField);
      } else {
        id = get(layer, 'feature.id');
      }

      if (e.ids.filter((idForDelete) => id === idForDelete).length > 0) {
        needCancel = true;
      }
    });

    if (needCancel) {
      if (this.get('loading')) {
        return;
      }

      this.set('dataItems', null);
      this.sendAction('editFeatureEnd');
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.set('parsingErrors', {});
    this.set('activeGeoTool', 'manual');
  },

  /**
    @method cancelEdit
    @private
  */
  cancelEdit(afterSave) {
    const mode = this.get('mode');
    const leafletObject = this.get('leafletObject');
    const leafletMap = this.get('leafletMap');

    const layers = this.get('layers');
    const latlngs = this.get('latlngs');
    const datas = this.get('data');
    const initialDatas = this.get('initialData');

    if (!isNone(layers) && mode !== 'Saved') {
      Object.keys(layers).forEach((index) => {
        const layer = layers[index];

        if (mode === 'Edit') {
          // отменим изменения в слое
          const latlng = latlngs[index];

          if (!isNone(layer) && !isNone(latlng)) {
            switch (layer.feature.geometry.type) {
              case 'Point':
                layer.setLatLng(latlng.layer);
                break;
              case 'LineString':
              case 'MultiLineString':
              case 'Polygon':
              case 'MultiPolygon':
                layer.setLatLngs(latlng.layer);
                break;
              default:
            }

            const label = get(layer, '_label');
            if (label) {
              label.setLatLng(latlng.label);
            }
          }

          if (afterSave) { // если уходим после неудачного сохранения, то надо данные вернуть
            const data = initialDatas[index];
            if (!isNone(data)) {
              data.forEach((key) => {
                if (data.property.hasOwnProperty.call(key)) {
                  const element = data[key];
                  if (!isEqual(element, get(layer.feature, `properties.${key}`))) {
                    set(layer.feature, `properties.${key}`, element);
                  }
                }
              });
            }

            // для надписей
            leafletObject.editLayer(layer);
          }

          delete latlngs[index];
          delete layers[index];
          delete datas[index];
          delete initialDatas[index];
        } else
        // удалить слой
        if (!isNone(layer)) {
          if (!isNone(leafletObject) && leafletObject.hasLayer(layer)) {
            leafletObject.removeLayer(layer);
          }

          if (leafletMap.hasLayer(layer)) {
            leafletMap.removeLayer(layer);
          }

          const label = get(layer, '_label');
          if (!isNone(label)) {
            if (!isNone(leafletObject) && leafletObject.hasLayer(label)) {
              leafletObject.removeLayer(label);
            }

            if (leafletMap.hasLayer(label)) {
              leafletMap.removeLayer(label);
            }
          }
        }
      });
    }

    if (!isNone(layers)) {
      // Сервисный слой общий с панелью атрибутов. Не надо очищать, если ничего не редактировали
      this.send('clearSelected');
    }

    this.set('latlngs', null);
    this.set('layers', null);

    this.set('data', null);
    this.set('initialData', null);
    this.set('choiceValueData', null);
    this.set('leafletObject', null);
    this.set('mode', null);
  },

  /**
    @method restoreLayers
    @private
  */
  restoreLayers() {
    return new Promise((rslv, reject) => {
      const initialLayers = this.get('dataItems.initialLayers');
      const leafletObject = this.get('leafletObject');

      if (!isNone(initialLayers) && !isNone(leafletObject)) {
        const featureIds = initialLayers.map((layer) => leafletObject.getLayerId(layer));

        const promise = leafletObject.cancelEdit(featureIds);

        this.set('loading', true);
        (promise || rslv()).then(() => {
          this.set('loading', false);
          this.cancelEdit(true);
          rslv();
        }).catch(() => {
          this.set('loading', false);
          this.cancelEdit(true);
          reject();
        });
      } else {
        rslv();
        this.cancelEdit(true);
      }
    });
  },

  selectLayer() {
    const layer = this.get(`layers.${this.get('curIndex')}`);
    if (!isNone(layer)) {
      this.send('selectFeature', [layer.feature]);
    }
  },

  _updateLabels() {
    const [_this, layer] = this;

    if (_this.get('mode') === 'Create') {
      return;
    }

    const leafletObject = _this.get('leafletObject');

    if (get(leafletObject, 'updateLabel') && typeof (leafletObject.updateLabel) === 'function') {
      leafletObject.updateLabel(layer);
    }
  },

  actions: {

    blockForm(block) {
      this.set('block', block);
    },

    updateLayer(layer, zoom) {
      if (isNone(layer.feature)) {
        set(layer, 'feature', { type: 'Feature', });
      }

      if (isNone(layer.feature.leafletLayer)) {
        set(layer.feature, 'leafletLayer', layer);
      }

      const leafletMap = this.get('leafletMap');
      if (!leafletMap.hasLayer(layer)) {
        leafletMap.addLayer(layer);
      }

      layer.enableEdit(leafletMap);

      if (zoom) {
        this.send('zoomTo', [layer.feature]);
        this.send('clearSelected');
      }

      const index = this.get('curIndex');
      this.set(`layers.${index}`, layer);

      layer.fire('create-layer:change', { layer, });
      this._updateLabels.apply([this, layer]);

      if (this.get('dataItemCount') > 1) {
        this.selectLayer();
      }
    },

    setGeometryTool(tool) {
      this.set('activeGeoTool', tool);
    },

    toggleAttributes() {
      const state = this.get('_attributesExpanded');
      this.set('_attributesExpanded', !state);
    },

    undo() {
      if (this.get('loading')) {
        return;
      }

      this.set('dataItems', null);
      this.sendAction('editFeatureEnd');
    },

    prev() {
      const index = this.get('curIndex');
      if (index > 1) {
        this.set('curIndex', index - 1);
        this.selectLayer();
      }
    },

    next() {
      const index = this.get('curIndex');
      const dataItemCount = this.get('dataItemCount');
      if (index < dataItemCount) {
        this.set('curIndex', index + 1);
        this.selectLayer();
      }
    },

    save() {
      if (this.get('loading')) {
        return;
      }

      this.set('error', null);
      let error = false;
      const datas = this.get('data');

      Object.keys(datas).forEach((index) => {
        const parsedData = this.parseData(index, datas[index]);
        if (isNone(parsedData)) {
          this.set('error', t('components.flexberry-edit-layer-feature.validation.data-errors'));
          error = true;
        }
      });

      if (error) {
        return;
      }

      const layerModel = this.get('layerModel');
      const leafletObject = this.get('layerModel.leafletObject');
      const initialLayers = this.get('dataItems.initialLayers');

      if (!isNone(initialLayers)) {
        initialLayers.forEach((l) => {
          if (!isNone(l)) {
            l.disableEdit();
            leafletObject.removeLayer(l);
          }
        });
      }

      const state = this.get('state');
      const layers = this.get('layers');

      let event = '';
      let createPromise;

      if (state === 'New') {
        const e = {
          layers: [],
          results: A(),
        };

        Object.keys(layers).forEach((index) => {
          let layer = layers[index];
          const data = datas[index];

          if (isNone(layer)) {
            this.set('error', t('components.flexberry-edit-layer-feature.validation.no-layer'));
            error = true;
            return;
          }

          layer.disableEdit();

          // создадим новый объект в слое
          if (leafletObject.createLayerObject) {
            this.get('leafletMap').removeLayer(layer);
            layer = leafletObject.createLayerObject(leafletObject, data, layer.toGeoJSON().geometry);
          } else {
            this.get('leafletMap').removeLayer(layer);
            set(layer, 'feature', { type: 'Feature', });
            set(layer.feature, 'properties', data);
            set(layer.feature, 'leafletLayer', layer);

            if (isNone(get(layer, 'feature.geometry'))) {
              const baseCrs = this.get('leafletObject.options.crs');
              const { geometry, } = layer.toProjectedGeoJSON(baseCrs);
              set(layer, 'feature.geometry', geometry);
            }

            e.layers.push(layer);
          }
        });

        if (error) {
          return;
        }

        leafletObject.fire('load', e);

        createPromise = new Promise((rslv) => {
          allSettled(e.results).then(() => {
            rslv();
          });
        });

        event = 'flexberry-map:create-feature';
      }

      if (state === 'Edit') {
        Object.keys(layers).forEach((index) => {
          const layer = layers[index];
          const data = datas[index];

          if (isNone(layer)) {
            this.set('error', t('components.flexberry-edit-layer-feature.validation.no-layer'));
            error = true;
            return;
          }

          const properties = Object.keys(this.get('leafletObject.readFormat.featureType.fields'));

          data.forEach((key) => {
            if (!properties.includes(key)) {
              delete layer.feature.properties[key];
            } else if (data.property.hasOwnProperty.call(key)) {
              const element = data[key];
              if (!isEqual(element, get(layer.feature, `properties.${key}`))) {
                set(layer.feature, `properties.${key}`, element);
              }
            }
          });

          layer.disableEdit();
          leafletObject.editLayer(layer);
        });

        event = 'flexberry-map:edit-feature';
      }

      if (error) {
        return;
      }

      const e = {
        layers: Object.values(layers),
        layerModel,
        initialFeatureKeys: this.get('dataItems.initialFeatureKeys'),
      };

      let saveSuccess;

      const saveFailed = () => {
        this.set('loading', false);
        this.set('error', t('components.flexberry-edit-layer-feature.validation.save-fail'));
        leafletObject.off('save:success', saveSuccess);

        this.restoreLayers().then(() => {
          this.get('leafletMap').fire(`${event}:fail`, e);
        }).catch(() => {
          // не удалось ни сохранить, ни восстановить слои. непонятно что делать
          console.log('Save and restore layer error');
        });
      };

      saveSuccess = (data) => {
        this.set('loading', false);
        leafletObject.off('save:failed', saveFailed);

        if (!isNone(data.layers) && isArray(data.layers) && data.layers.length > 0) {
          if (state === 'New') {
            e.layers.forEach((l) => {
              this.get('leafletMap').removeLayer(l);
            });
          }

          data.layers.forEach((layer) => {
            if (isNone(get(layer, 'feature.leafletLayer'))) {
              set(layer.feature, 'leafletLayer', layer);
            }
          });

          set(e, 'layers', data.layers);
        }

        if (this.get('isFavorite')) {
          this.get('leafletMap').fire('flexberry-map:updateFavorite', e);
        }

        this.get('leafletMap').fire(`${event}:end`, e);
        this.set('mode', 'Saved');
        this.sendAction('editFeatureEnd');
      };

      leafletObject.off('save:failed', saveFailed);
      leafletObject.off('save:success', saveSuccess);

      leafletObject.once('save:failed', saveFailed);
      leafletObject.once('save:success', saveSuccess);

      this.set('loading', true);
      try {
        (createPromise || resolve()).then(() => {
          leafletObject.save();
        });
      } catch (ex) {
        leafletObject.off('save:failed', saveFailed);
        leafletObject.off('save:success', saveSuccess);

        this.set('loading', false);
        this.set('error', t('components.flexberry-edit-layer-feature.validation.save-fail'));
      }
    },

    /**
      Handles a new geometry draw start.

      @param {Object} geometryType Type of geometry to be drawn.
    */
    onAddDrawStart(geometryType) {
      if (geometryType === 'circle' || geometryType === 'rectangle') {
        return;
      }

      const leafletObject = this.get('leafletObject');
      const allLayers = [];
      leafletObject.eachLayer((layer) => {
        allLayers.push(layer);
      });

      this.set('_snapLayers', allLayers);
      const leafletMap = this.get('leafletMap');
      const editTools = this._getEditTools();
      set(leafletMap, 'editTools', editTools);
      this.set('_snapMarker', L.marker(leafletMap.getCenter(), {
        icon: leafletMap.editTools.createVertexIcon({ className: 'leaflet-div-icon leaflet-drawing-icon', }),
        opacity: 1,
        zIndexOffset: 1000,
      }));

      leafletMap.off('editable:drawing:move', this._handleSnapping, this);
      leafletMap.on('editable:drawing:move', this._handleSnapping, this);

      leafletMap.off('editable:drawing:end', this._cleanupSnapping, this);
      leafletMap.on('editable:drawing:end', this._cleanupSnapping, this);

      leafletMap.off('editable:drawing:click', this._drawClick, this);
      leafletMap.on('editable:drawing:click', this._drawClick, this);
    },
  },
});
