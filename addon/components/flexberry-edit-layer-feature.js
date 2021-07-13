import Ember from 'ember';
import layout from '../templates/components/flexberry-edit-layer-feature';
import SnapDrawMixin from '../mixins/snap-draw';
import EditFeatureMixin from '../mixins/edit-feature';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import WfsLayer from '../layers/wfs';
import OdataLayer from '../layers/odata-vector';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend(SnapDrawMixin, LeafletZoomToFeatureMixin, EditFeatureMixin, {
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

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

  state: Ember.computed('mode', function () {
    let mode = this.get('mode');

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

  dataItemCount: Ember.computed('dataItems', function () {
    let items = this.get('dataItems.items');
    if (Ember.isNone(items)) {
      return 0;
    }

    return items.length;
  }),

  _dataItemObserver: Ember.observer('dataItems', function () {
    let leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.tools.enable('drag');

    this.set('error', null);

    // Уберем редактирование с объектов, если оно было
    let layers = this.get('layers');
    if (layers) {
      Object.values(layers).filter((layer) => !Ember.isNone(layer)).forEach((layer) => {
        let enabled = Ember.get(layer, 'editor._enabled');
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
    let dataItems = this.get('dataItems');
    if (dataItems) {
      this.set('curIndex', 1);
      this.set('latlngs', {});
      this.set('layers', {});
      this.set('data', {});
      this.set('initialData', {});
      this.set('mode', dataItems.mode);

      this.set('choiceValueData', dataItems.choiceValueData); // эта штука должна быть только одна

      let editTools = this._getEditTools();
      Ember.set(leafletMap, 'editTools', editTools);

      dataItems.items.forEach((dataItem) => {
        let layer = dataItem.layer;

        if (!Ember.isNone(layer)) {
          if (Ember.isNone(layer.feature.leafletLayer)) {
            Ember.set(layer.feature, 'leafletLayer', layer);
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
            }

            let latlngcopy = {
              layer: this.copy(latlngs),
              label: null
            };

            let label = Ember.get(layer, '_label');
            if (label) {
              latlngcopy.label = this.copy(label.getLatLng());
            }

            this.set(`latlngs.${index}`, latlngcopy);
          }

          let isMarker = layer instanceof L.Marker || layer instanceof L.CircleMarker;

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

        let data = dataItem.data;
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

  _model: Ember.computed('layerModel', 'i18n.locale', function () {
    let layer = this.get('layerModel');

    if (Ember.isNone(layer)) {
      return {};
    }

    let settings = Ember.get(layer, 'settings') || {};

    let leafletObject = Ember.get(layer, 'leafletObject');
    this.set('leafletObject', leafletObject);
    let readonly = Ember.get(settings, 'readonly') || false;

    let availableDrawTools = null;
    let typeGeometry = null;

    if (!readonly) {
      let geometryFields = Ember.get(leafletObject, 'readFormat.featureType.geometryFields');
      availableDrawTools = this._getAvailableDrawTools(geometryFields);
      typeGeometry = this._getTypeGeometry(geometryFields);
    }

    let getHeader = () => {
      let result = {};
      let locale = this.get('i18n.locale');
      let localizedProperties = Ember.get(settings, `localizedProperties.${locale}`) || {};
      let excludedProperties = Ember.get(settings, `excludedProperties`);
      excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();

      for (let propertyName in Ember.get(leafletObject, 'readFormat.featureType.fields')) {
        if (excludedProperties.contains(propertyName)) {
          continue;
        }

        let propertyCaption = Ember.get(localizedProperties, propertyName);

        result[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
      }

      return result;
    };

    return {
      availableDrawTools: availableDrawTools,
      typeGeometry: typeGeometry,
      name: Ember.get(layer, 'layerModel.name'),
      layerCRS: Ember.get(leafletObject, 'options.crs'),
      layerFields: Ember.get(leafletObject, 'readFormat.featureType.fields'),
      fieldTypes: Ember.get(leafletObject, 'readFormat.featureType.fieldTypes'),
      fieldParsers: Ember.get(leafletObject, 'readFormat.featureType.fields'),
      fieldValidators: Ember.get(leafletObject, 'readFormat.featureType.fieldValidators'),
      fieldNames: getHeader()
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
  choiceValueObserver: Ember.observer('choiceValue', function () {
    let choiceValueData = this.get('choiceValueData');
    let choiceValue = this.get('choiceValue');
    let index = this.get('curIndex');
    this.set('data', {});
    if (!Ember.isNone(choiceValueData)) {
      if (!Ember.isNone(choiceValue) && !Ember.isBlank(choiceValue)) {
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
  choiceValueDataObserver: Ember.observer('choiceValueData', function () {
    let choiceValueData = this.get('choiceValueData');
    if (!Ember.isNone(choiceValueData)) {
      let choice = Object.keys(choiceValueData).map((index) => {
        return Number(index) + 1;
      });

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
    let fieldNames = this.get('_model.fieldNames');
    let fieldParsers = this.get('_model.fieldParsers');
    let fieldValidators = this.get('_model.fieldValidators');

    let parsingErrors = {};
    let dataIsValid = true;

    for (let fieldName in fieldNames) {
      if (!fieldNames.hasOwnProperty(fieldName)) {
        continue;
      }

      let text = Ember.get(data, fieldName);
      let value = fieldParsers[fieldName](text);
      let valueIsValid = fieldValidators[fieldName](value);

      if (valueIsValid) {
        Ember.set(data, fieldName, value);
      }

      dataIsValid = dataIsValid && valueIsValid;
      Ember.set(parsingErrors, fieldName, !valueIsValid);
    }

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
      let latLngCopy = [];
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
    if (!Ember.isNone(geometryFields)) {
      let firstField = Object.keys(geometryFields)[0];
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
      }
    }

    return ['marker', 'circle', 'polyline', 'rectangle', 'polygon'];
  },

  /**
    Return geometry type.

    @param {Object} geometryFields Hash with the layer geometry field names and their types.
  */
  _getTypeGeometry(geometryFields) {
    if (!Ember.isNone(geometryFields)) {
      let firstField = Object.keys(geometryFields)[0];
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
    let leafletMap = this.get('leafletMap');

    leafletMap.off('editable:vertex:drag', this._handleSnapping, this);
    leafletMap.on('editable:vertex:drag', this._handleSnapping, this);

    leafletMap.off('editable:vertex:dragend', this._cleanupSnapping, this);
    leafletMap.on('editable:vertex:dragend', this._cleanupSnapping, this);
  },

  _snapLeafletLayers: Ember.computed('_snapLayers', function () {
    return this.get('_snapLayers');
  }),

  mapObserver: Ember.observer('leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('flexberry-map:delete-feature:start', this._onDelete, this);
    }
  }),

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.off('flexberry-map:delete-feature:start', this._onDelete, this);
    }
  },

  _onDelete(e) {
    let datas = this.get('initialData');
    let layers = this.get('layers');
    if (Ember.isNone(datas) || Ember.isNone(layers)) {
      return;
    }

    if (Ember.isNone(e.ids)) {
      return;
    }

    let mapModelApi = this.get('mapApi').getFromApi('mapModel');
    let pkField = mapModelApi._getPkField(this.get('layerModel.layerModel'));
    let needCancel = false;

    Object.keys(datas).forEach((key) => {
      let data = datas[key];
      let layer = layers[key];

      let id;
      if (data.hasOwnProperty(pkField)) {
        id = Ember.get(data, pkField);
      } else {
        id = Ember.get(layer, 'feature.id');
      }

      if (e.ids.filter((idForDelete) => { return id === idForDelete; }).length > 0) {
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
    let mode = this.get('mode');
    let leafletObject = this.get('leafletObject');
    let leafletMap = this.get('leafletMap');

    let layers = this.get('layers');
    let latlngs = this.get('latlngs');
    let datas = this.get('data');
    let initialDatas = this.get('initialData');

    if (!Ember.isNone(layers) && mode !== 'Saved') {
      Ember.keys(layers).forEach((index) => {
        let layer = layers[index];

        if (mode === 'Edit') {
          // отменим изменения в слое
          let latlng = latlngs[index];

          if (!Ember.isNone(layer) && !Ember.isNone(latlng)) {
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
            }

            let label = Ember.get(layer, '_label');
            if (label) {
              label.setLatLng(latlng.label);
            }
          }

          if (afterSave) { // если уходим после неудачного сохранения, то надо данные вернуть
            let data = initialDatas[index];
            if (!Ember.isNone(data)) {
              for (var key in data) {
                if (data.hasOwnProperty(key)) {
                  var element = data[key];
                  if (!Ember.isEqual(element, Ember.get(layer.feature, `properties.${key}`))) {
                    Ember.set(layer.feature, `properties.${key}`, element);
                  }
                }
              }
            }

            // для надписей
            leafletObject.editLayer(layer);
          }

          delete latlngs[index];
          delete layers[index];
          delete datas[index];
          delete initialDatas[index];

        } else {
          // удалить слой
          if (!Ember.isNone(layer)) {
            if (!Ember.isNone(leafletObject) && leafletObject.hasLayer(layer)) {
              leafletObject.removeLayer(layer);
            }

            if (leafletMap.hasLayer(layer)) {
              leafletMap.removeLayer(layer);
            }

            let label = Ember.get(layer, '_label');
            if (!Ember.isNone(label)) {
              if (!Ember.isNone(leafletObject) && leafletObject.hasLayer(label)) {
                leafletObject.removeLayer(label);
              }

              if (leafletMap.hasLayer(label)) {
                leafletMap.removeLayer(label);
              }
            }
          }
        }
      });
    }

    if (!Ember.isNone(layers)) {
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let initialLayers = this.get('dataItems.initialLayers');
      let leafletObject = this.get('leafletObject');

      if (!Ember.isNone(initialLayers) && !Ember.isNone(leafletObject)) {
        let layerModel = this.get('layerModel.layerModel');
        let className = Ember.get(layerModel, 'type');
        let layerType = Ember.getOwner(this).knownForType('layer', className);

        let featureIds = Ember.A();

        initialLayers.forEach((layer) => {
          let editTools = this._getEditTools();
          if (!Ember.isNone(layer.editor)) {
            let editLayer = layer.editor.editLayer;
            editTools.editLayer.removeLayer(editLayer);
          }

          if (leafletObject.hasLayer(layer)) {
            leafletObject.removeLayer(layer);
          }

          let map = Ember.get(leafletObject, '_map');
          map.removeLayer(layer);

          let id = leafletObject.getLayerId(layer);
          delete leafletObject._layers[id];

          if (layerType instanceof OdataLayer) {
            let model = Ember.get(layer, 'model');
            model.rollbackAttributes();
          }

          if (layerType instanceof WfsLayer) {
            let id = leafletObject.getLayerId(layer);
            delete leafletObject.changes[id];
          }

          featureIds.push(Ember.get(layer, 'feature.properties.primarykey'));
        });

        let promise;

        if (layerType instanceof WfsLayer) {
          let filters = featureIds.map((pk) => {
            return new L.Filter.EQ('primarykey', pk);
          });

          let filter;
          if (filters.length === 1) {
            filter = filters[0];
          } else {
            filter = new L.Filter.Or(...filters);
          }

          promise = leafletObject.loadFeatures(filter);
        } else if (layerType instanceof OdataLayer) {
          let e = {
            featureIds: featureIds
          };

          promise = leafletObject.loadLayerFeatures(e);
        }

        this.set('loading', true);
        (promise ? promise : Ember.RSVP.resolve()).then(() => {
          this.set('loading', false);
          this.cancelEdit(true);
          resolve();
        }).catch(() => {
          this.set('loading', false);
          this.cancelEdit(true);
          reject();
        });

      } else {
        resolve();
        this.cancelEdit(true);
      }
    });
  },

  selectLayer() {
    let layer = this.get(`layers.${this.get('curIndex')}`);
    if (!Ember.isNone(layer)) {
      this.send('selectFeature', [layer.feature]);
    }
  },

  _updateLabels() {
    let [_this, layer] = this;

    if (_this.get('mode') === 'Create') {
      return;
    }

    let leafletObject = _this.get('leafletObject');

    if (Ember.get(leafletObject, 'updateLabel') && typeof (leafletObject.updateLabel) === 'function') {
      leafletObject.updateLabel(layer);
    }
  },

  actions: {

    blockForm(block) {
      this.set('block', block);
    },

    updateLayer(layer, zoom) {
      if (Ember.isNone(layer.feature)) {
        Ember.set(layer, 'feature', { type: 'Feature' });
      }

      if (Ember.isNone(layer.feature.leafletLayer)) {
        Ember.set(layer.feature, 'leafletLayer', layer);
      }

      let leafletMap = this.get('leafletMap');
      if (!leafletMap.hasLayer(layer)) {
        leafletMap.addLayer(layer);
      }

      layer.enableEdit(leafletMap);

      if (zoom) {
        this.send('zoomTo', [layer.feature]);
        this.send('clearSelected');
      }

      let index = this.get('curIndex');
      this.set(`layers.${index}`, layer);

      layer.fire('create-layer:change', { layer: layer });
      this._updateLabels.apply([this, layer]);

      if (this.get('dataItemCount') > 1) {
        this.selectLayer();
      }
    },

    setGeometryTool(tool) {
      this.set('activeGeoTool', tool);
    },

    toggleAttributes() {
      let state = this.get('_attributesExpanded');
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
      let index = this.get('curIndex');
      if (index > 1) {
        this.set('curIndex', index - 1);
        this.selectLayer();
      }
    },

    next() {
      let index = this.get('curIndex');
      let dataItemCount = this.get('dataItemCount');
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
      let datas = this.get('data');

      Object.keys(datas).forEach((index) => {
        let parsedData = this.parseData(index, datas[index]);
        if (Ember.isNone(parsedData)) {
          this.set('error', t('components.flexberry-edit-layer-feature.validation.data-errors'));
          error = true;
          return;
        }
      });

      if (error) {
        return;
      }

      let layerModel = this.get('layerModel');
      let leafletObject = this.get('layerModel.leafletObject');
      let initialLayers = this.get('dataItems.initialLayers');

      if (!Ember.isNone(initialLayers)) {
        initialLayers.forEach((l) => {
          if (!Ember.isNone(l)) {
            l.disableEdit();
            leafletObject.removeLayer(l);
          }
        });
      }

      let state = this.get('state');
      let layers = this.get('layers');

      let event = '';
      let createPromise;

      if (state === 'New') {
        let e = {
          layers: [],
          results: Ember.A()
        };

        Object.keys(layers).forEach((index) => {
          let layer = layers[index];
          let data = datas[index];

          if (Ember.isNone(layer)) {
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
            Ember.set(layer, 'feature', { type: 'Feature' });
            Ember.set(layer.feature, 'properties', data);
            Ember.set(layer.feature, 'leafletLayer', layer);

            if (Ember.isNone(Ember.get(layer, 'feature.geometry'))) {
              let baseCrs = this.get('leafletObject.options.crs');
              let geometry = layer.toProjectedGeoJSON(baseCrs).geometry;
              Ember.set(layer, 'feature.geometry', geometry);
            }

            e.layers.push(layer);
          }
        });

        if (error) {
          return;
        }

        leafletObject.fire('load', e);

        createPromise = new Ember.RSVP.Promise((resolve) => {
          Ember.RSVP.allSettled(e.results).then(() => {
            resolve();
          });
        });

        event = 'flexberry-map:create-feature';
      }

      if (state === 'Edit') {
        Object.keys(layers).forEach((index) => {
          let layer = layers[index];
          let data = datas[index];

          if (Ember.isNone(layer)) {
            this.set('error', t('components.flexberry-edit-layer-feature.validation.no-layer'));
            error = true;
            return;
          }

          let properties = Object.keys(this.get('leafletObject.readFormat.featureType.fields'));

          for (var key in data) {
            if (!properties.contains(key)) {
              delete layer.feature.properties[key];
              continue;
            }

            if (data.hasOwnProperty(key)) {
              var element = data[key];
              if (!Ember.isEqual(element, Ember.get(layer.feature, `properties.${key}`))) {
                Ember.set(layer.feature, `properties.${key}`, element);
              }
            }
          }

          layer.disableEdit();
          leafletObject.editLayer(layer);
        });

        event = 'flexberry-map:edit-feature';
      }

      if (error) {
        return;
      }

      let e = {
        layers: Object.values(layers),
        layerModel: layerModel,
        initialFeatureKeys: this.get('dataItems.initialFeatureKeys')
      };

      let saveFailed = () => {
        this.set('loading', false);
        this.set('error', t('components.flexberry-edit-layer-feature.validation.save-fail'));
        leafletObject.off('save:success', saveSuccess);

        this.restoreLayers().then(() => {
          this.get('leafletMap').fire(event + ':fail', e);
        }).catch(() => {
          // не удалось ни сохранить, ни восстановить слои. непонятно что делать
          console.log('Save and restore layer error');
        });
      };

      let saveSuccess = (data) => {
        this.set('loading', false);
        leafletObject.off('save:failed', saveFailed);

        if (!Ember.isNone(data.layers) && Ember.isArray(data.layers) && data.layers.length > 0) {
          if (state === 'New') {
            e.layers.forEach((l) => {
              this.get('leafletMap').removeLayer(l);
            });
          }

          data.layers.forEach((layer) => {
            if (Ember.isNone(Ember.get(layer, 'feature.leafletLayer'))) {
              Ember.set(layer.feature, 'leafletLayer', layer);
            }
          });

          Ember.set(e, 'layers', data.layers);
        }

        if (this.get('isFavorite')) {
          this.get('leafletMap').fire('flexberry-map:updateFavorite', e);
        }

        this.get('leafletMap').fire(event + ':end', e);
        this.set('mode', 'Saved');
        this.sendAction('editFeatureEnd');
      };

      leafletObject.off('save:failed', saveFailed);
      leafletObject.off('save:success', saveSuccess);

      leafletObject.once('save:failed', saveFailed);
      leafletObject.once('save:success', saveSuccess);

      this.set('loading', true);
      try {
        (createPromise ? createPromise : Ember.RSVP.resolve()).then(() => {
          leafletObject.save();
        });
      }
      catch (ex) {
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

      let leafletObject = this.get('leafletObject');
      let allLayers = [];
      leafletObject.eachLayer((layer) => {
        allLayers.push(layer);
      });

      this.set('_snapLayers', allLayers);
      let leafletMap = this.get('leafletMap');
      let editTools = this._getEditTools();
      Ember.set(leafletMap, 'editTools', editTools);
      this.set('_snapMarker', L.marker(leafletMap.getCenter(), {
        icon: leafletMap.editTools.createVertexIcon({ className: 'leaflet-div-icon leaflet-drawing-icon' }),
        opacity: 1,
        zIndexOffset: 1000
      }));

      leafletMap.off('editable:drawing:move', this._handleSnapping, this);
      leafletMap.on('editable:drawing:move', this._handleSnapping, this);

      leafletMap.off('editable:drawing:end', this._cleanupSnapping, this);
      leafletMap.on('editable:drawing:end', this._cleanupSnapping, this);

      leafletMap.off('editable:drawing:click', this._drawClick, this);
      leafletMap.on('editable:drawing:click', this._drawClick, this);
    },
  }
});
