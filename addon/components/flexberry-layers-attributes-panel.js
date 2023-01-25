/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-attributes-panel';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import SnapDrawMixin from '../mixins/snap-draw';
import EditFeatureMixin from '../mixins/edit-feature';
import checkIntersect from '../utils/polygon-intersect-check';

import * as buffer from 'npm:@turf/buffer';
import * as lineSplit from 'npm:@turf/line-split';
import * as polygonToLine from 'npm:@turf/polygon-to-line';
import * as lineToPolygon from 'npm:@turf/line-to-polygon';
import * as booleanWithin from 'npm:@turf/boolean-within';
import * as kinks from 'npm:@turf/kinks';
import * as helper from 'npm:@turf/helpers';
import * as lineIntersect from 'npm:@turf/line-intersect';
import * as lineSlice from 'npm:@turf/line-slice';
import * as invariant from 'npm:@turf/invariant';
import * as distance from 'npm:@turf/distance';
import * as midpoint from 'npm:@turf/midpoint';

import jsts from 'npm:jsts';

/**
  The component for editing layers attributes.

  @class FlexberryLayersAttributesPanelComponent
  @uses LeafletZoomToFeatureMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend(SnapDrawMixin, LeafletZoomToFeatureMixin, EditFeatureMixin, {
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

  /**
    Reference to 'layers-styles-renderer' servie.

    @property layersStylesRenderer
    @type LayersStylesRendererService
  */
  layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Measure units for buffer tool.

    @property bufferUnits
    @type Object
  */
  bufferUnits: {
    meters: 'components.flexberry-layers-attributes-panel.buffer.units.meters',
    kilometers: 'components.flexberry-layers-attributes-panel.buffer.units.kilometers'
  },

  /**
    Selected mesure unit.

    @property _selectedUnit
    @type String
    @default undefined
    @private
  */
  _selectedUnit: undefined,

  /**
    Buffer radius.

    @property _radius
    @type Number
    @default 500
    @private
  */
  _radius: 500,

  /**
    Layer with buffer.

    @property _bufferLayer
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Layer</a>
    @default null
    @private
  */
  _bufferLayer: null,

  _activeTabs: {},

  /**
    Cache for tab models.

    @property _tabModelsCache
    @type Array
    @private
  */
  _tabModelsCache: Ember.A(),

  /**
   Object contains extra data for OData layer
   @type Object
   @param {Model} model Model object for OData layer.
   @param {Projection} modelProj Projection object for OData layer.
   @param {String} modelName Layer's model name
   @param {String} projectionName Layer's projection name
   */
  extraLayerData: Ember.Object.extend({
    model: null,
    modelProj: null,
    modelName: null,
    projectionName: null
  }),

  /**
   Component name for rendering edit dialog.

   @property _editComponentName
   @type String
   @default 'layers-dialogs/attributes/edit'
   */
  _editComponentName: 'layers-dialogs/attributes/edit',

  /**
   Flag indicates whether to enable attributes values editing on panel or not

   @property _isPanelEditable
   @type Boolean
   @default true
   */
  _isPanelEditable: true,

  /**
    The last page in the table.

    @property lastPage
    @type Number
    @default 1
  */
  lastPage: 1,

  /**
    The last page in the table.

    @property pageSize
    @type Number
    @default 1
  */
  pageSize: 5,

  /**
    Computed property that builds tab models collection from items.

    @property _tabModels
    @type Object[]
    @private
    @readonly
  */
  _tabModels: Ember.computed('items.[]', 'i18n.locale', function () {
    let editedLayers = this.get('items');
    if (Ember.isPresent(editedLayers)) {
      if (editedLayers.length === 1) {
        this.set('_featureTabsOffset', 0);
        this.send('onTabMove', true);
      }

      let tabModels = editedLayers.map((item) => {
        let name = Ember.get(item, 'name');
        let layerModel = Ember.get(item, 'layerModel');
        let leafletObject = Ember.get(item, 'leafletObject');
        let readonly = Ember.get(item, 'settings.readonly') || false;
        let styleSettings = Ember.get(item, 'settings.styleSettings') || {};
        let settings = Ember.get(item, 'settings') || {};

        let getHeader = () => {
          let result = {};
          let locale = this.get('i18n.locale');
          let localizedProperties = Ember.get(item, `settings.localizedProperties.${locale}`) || {};
          let excludedProperties = Ember.get(item, `settings.excludedProperties`);
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

        let tabModel = Ember.Object.extend({
          _top: this.get('pageSize'),
          _skip: 0,
          _selectedRows: {},
          _editedRows: {},
          _selectedRowsCount: Ember.computed('_selectedRows', function () {
            let selectedRows = Ember.get(this, '_selectedRows');
            return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).length;
          }),

          _typeSelectedRows: Ember.computed('_selectedRows', function () {
            let typeElements = {
              point: 0,
              line: 0,
              polygon: 0,
              multiLine: 0,
              multiPolygon: 0
            };
            let selectedRows = Ember.get(this, '_selectedRows');
            Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
              .map((key) => {
                let feature = this.get('featureLink')[key].feature;
                let layer = feature.leafletLayer.toGeoJSON();
                switch (layer.geometry.type) {
                  case 'Point':
                    typeElements.point++;
                    break;
                  case 'LineString':
                    typeElements.line++;
                    break;
                  case 'MultiLineString':
                    typeElements.multiLine++;
                    break;
                  case 'Polygon':
                    typeElements.polygon++;
                    break;
                  case 'MultiPolygon':
                    typeElements.multiPolygon++;
                    break;
                }
              });
            return typeElements;
          }),

          _selectedRowsProperties: Ember.computed('_selectedRows', 'featureLink', function () {
            let selectedRows = Ember.get(this, '_selectedRows');
            let featureLink = Ember.get(this, 'featureLink');
            let result = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
              .map((key) => {
                return featureLink[key].feature.properties;
              });

            return result.length > 0 ? result : Ember.get(this, 'properties');
          }),

          featureLink: null,
          propertyLink: null,
          properties: null,

          selectAll: false,

          // paging implementation
          propertiesToShow: Ember.computed('properties.[]', '_top', '_skip', function () {
            let properties = this.get('properties');
            let top = this.get('_top');
            let skip = this.get('_skip');
            return properties.slice(skip, skip + top);
          }),

          i18n: Ember.inject.service('i18n'),

          header: Ember.computed('i18n.locale', getHeader),

          _reload(data) {
            this.set('featureLink', {});
            this.set('propertyLink', {});
            let properties = Ember.A();
            let _this = this;

            var addProperties = function (layer) {
              if (Ember.isNone(Ember.get(layer, 'feature'))) {
                Ember.set(layer, 'feature', {});
              }

              let props = Ember.get(layer, 'feature.properties');
              let propId = Ember.guidFor(props);
              if (Ember.isNone(Ember.get(layer, 'feature.leafletLayer'))) {
                Ember.set(layer.feature, 'leafletLayer', layer);
              }

              // the hash containing guid of properties object and link to feature layer
              _this.set(`featureLink.${propId}`, layer);

              // the hash containing guid of properties object and link to that object
              _this.set(`propertyLink.${propId}`, props);

              properties.pushObject(props);
            };

            if (!Ember.isNone(data)) {
              properties = this.get('properties');
              data.forEach((layer) => {
                addProperties(layer);
              });
            } else {
              leafletObject.eachLayer((layer) => {
                addProperties(layer);
              });
            }

            this.set('properties', properties);
          },

          /**
            Mark layer as changed.

            @param {Object} e Event object.
          */
          _triggerChanged(e) {
            let [tabModel, layer, setEdited] = this;
            if (Ember.isEqual(Ember.guidFor(e.layer), Ember.guidFor(layer))) {
              Ember.set(tabModel, 'leafletObject._wasChanged', true);
              tabModel.notifyPropertyChange('leafletObject._wasChanged');

              if (setEdited) {
                tabModel.leafletObject.editLayer(layer);
              }
            }
          },

          init() {
            this.get('i18n.locale');
            this._reload();
          },

          willDestroy() {
            this.set('featureLink', null);
            this.set('propertyLink', null);
            this.set('properties', null);
          }
        });

        let cachedTab = this.get('_tabModelsCache').find((tab) => Ember.isEqual(tab.get('leafletObject'), leafletObject));
        if (!Ember.isNone(cachedTab)) {
          cachedTab.set('name', name);

          return cachedTab;
        }

        let newTab = tabModel.create(
          Ember.getOwner(this).ownerInjection(),
          {
            name,
            allowEdit: !readonly,
            allowEditOnList: this.get('_isPanelEditable'),
            leafletObject,
            styleSettings,
            layerModel,
            settings
          }
        );

        this.get('_tabModelsCache').addObject(newTab);

        return newTab;
      });

      return tabModels;
    }
  }),

  /**
    Offset of tab panel in pixels.

    @property _featureTabsOffset
    @type Number
    @default 0
    @private
    @readonly
  */
  _featureTabsOffset: 0,

  /**
    Data for 'onDifferenceClick'.

    @property _dataForDifference
    @type Array
    @default null
    @private
  */
  _dataForDifference: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Selected tab index.

    @property selectedTabIndex
    @type Number
    @default 0
  */
  selectedTabIndex: 0,

  /**
    Flag indicates that the panel is folded or not.

    @property folded
    @type Boolean
    @default false
  */
  folded: false,

  /**
    Flag indicates that the panel is loading or not.

    @property loading
    @type Boolean
    @default false
  */
  loading: false,

  /**
    Collection of tab items.

    @property items
    @type Object[]
    @default null
  */
  items: null,

  /**
    Integration with the layer tree

    @property settings
    @type Boolean
    @default null
  */
  settings: null,

  /**
    @property _deleteRowDialogHasBeenRequested
    @type boolean
    @default false
  */
  _deleteRowDialogHasBeenRequested: false,

  /**
    @property _deleteRowDialogIsVisible
    @type boolean
    @default false
  */
  _deleteRowDialogIsVisible: false,

  /**
    @property _deleteRowTabModel
    @type boolean
    @default false
  */
  _deleteRowTabModel: false,

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);
    this.get('mapApi').addToApi('_deleteLayerFromAttrPanel', this._deleteLayerById.bind(this));
  },

  mapObserver: Ember.observer('leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('flexberry-map:create-feature:end', this._onCreate, this);
      leafletMap.on('flexberry-map:edit-feature:end', this._onEdit, this);
      leafletMap.on('flexberry-map:create-feature:fail', this._onFail, this);
      leafletMap.on('flexberry-map:edit-feature:fail', this._onFail, this);
    }
  }),

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.off('flexberry-map:create-feature:end', this._onCreate, this);
      leafletMap.off('flexberry-map:edit-feature:end', this._onEdit, this);
      leafletMap.off('flexberry-map:create-feature:fail', this._onFail, this);
      leafletMap.off('flexberry-map:edit-feature:fail', this._onFail, this);
    }
  },

  _getTab(e) {
    let _tabModels = this.get('_tabModels');
    let id = Ember.get(e.layerModel, 'layerModel.id');

    if (Ember.isNone(_tabModels) || Ember.isNone(id)) {
      return null;
    }

    let tab = _tabModels.find((tab) => {
      return Ember.get(tab, 'layerModel.id') === id;
    });

    return tab;
  },

  _onFail(e) {
    let tabModel = this._getTab(e);
    if (Ember.isNone(tabModel)) {
      return;
    }

    tabModel._reload();
    Ember.set(tabModel, '_selectedRows', {});
    Ember.set(tabModel, '_editedRows', {});
  },

  _onCreate(e) {
    let tabModel = this._getTab(e);
    if (Ember.isNone(tabModel)) {
      return;
    }

    if (e.layers.filter((l) => {
      return Ember.isNone(Ember.get(l, 'feature.leafletLayer'));
    }).length > 0) {
      return;
    }

    Ember.set(tabModel, '_selectedRows', {});
    Ember.set(tabModel, '_editedRows', {});

    let features = [];
    e.layers.forEach((layer) => {
      let props = Ember.get(layer, 'feature.properties');
      let propId = Ember.guidFor(props);

      Ember.set(tabModel, `featureLink.${propId}`, layer);
      Ember.set(tabModel, `propertyLink.${propId}`, props);
      tabModel.properties.addObject(props);

      features.push(layer.feature);
    });

    this.send('zoomTo', features);

    if (!Ember.isNone(e.initialFeatureKeys)) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let editedRows = Ember.get(tabModel, '_editedRows');

      e.initialFeatureKeys.forEach((key) => {
        this._deleteLayerByKey(tabModel, key, selectedRows, editedRows);
      });
    }

    const lastPage = Math.ceil(tabModel.properties.length / tabModel._top);

    Ember.set(this, 'lastPage', lastPage);

    const skip = tabModel._top * (lastPage - 1);
    tabModel.set('_skip', skip);

    this.send('onClearFoundItemClick');
  },

  _onEdit(e) {
    if (!e) {
      return;
    }
  },

  /**
    Delete layer by key.

    @param {Object} tabModel Tab model.
    @param {String} key Layer key.
    @param {Array} selectedRows Array of selected records.
    @param {Array} selectedRows Array of edited records.
  */
  _deleteLayerByKey(tabModel, key, selectedRows, editedRows) {
    let layer = tabModel.featureLink[key];
    if (layer) {
      if (tabModel.leafletObject.hasLayer(layer)) {
        tabModel.leafletObject.removeLayer(layer);
      }

      let enabled = Ember.get(layer, 'editor._enabled');
      if (enabled) {
        layer.disableEdit();
      }
    }

    tabModel.properties.removeObject(tabModel.propertyLink[key]);
    delete tabModel.propertyLink[key];
    delete tabModel.featureLink[key];

    if (Ember.get(selectedRows, key) || false) {
      delete selectedRows[key];
    }

    if (Ember.get(editedRows, key) || false) {
      delete editedRows[key];
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let settings = this.get('settings');
    if (Ember.isNone(settings)) {
      settings = {
        withToolbar: false,
        sidebarOpened: false,
      };

      settings.drawTools = {};
      this.set('settings', settings);
    }

    this.set('_selectedUnit', 'meters');
  },

  _foldTabs() {
    this.set('folded', !this.get('folded'));

    // While executing transition vertical scroll will always appear, it is unnecessary and looks very strange,
    // so we can hide scroll untill transition end.
    let $tabs = this.$('.bottompanel-tab-data-panel');
    $tabs.css('overflow', 'hidden');
    this.$('.ui.bottom.bottompanel').one('webkitTransitionEnd mozTransitionEnd oTransitionEnd otransitionend transitionend', () => {
      $tabs.css('overflow', 'auto');
    });
  },

  actions: {
    /**
      Handles click on a tab.

      @method actions.onTabSelect
      @param {Number} index Selected tab index.
    */
    onTabSelect(index) {
      if (index === this.get('selectedTabIndex')) {
        this._foldTabs();
      } else {
        this.set('selectedTabIndex', index);
        if (this.get('folded')) {
          this.set('folded', false);
        }
      }
    },

    /**
      Handles click on tab close icon.

      @method actions.closeTab
      @param {Number} index closed tab index.
    */
    closeTab(index) {
      let tabModel = this.get(`_tabModels.${index}`);

      let editedLayers = this.get('items');
      if (editedLayers.length === 1) {
        this.set('lastPage', 1);
      }

      let selectedTabIndex = this.get('selectedTabIndex');
      this.get('_tabModelsCache').removeObject(tabModel);
      editedLayers.removeAt(index);
      if (selectedTabIndex >= index && selectedTabIndex - 1 >= 0) {
        this.set('selectedTabIndex', selectedTabIndex - 1);
      }

      let serviceLayer = this.get('serviceLayer');
      if (!Ember.isNone(serviceLayer)) {
        serviceLayer.clearLayers();
      }
    },

    /**
      Handles click on tab.

      @method actions.onTabClick
      @param {String} tabModelName Tab's model name.
      @param {Object} e Event object.
    */
    onTabClick(tabModelName, e) {
      e = Ember.$.event.fix(e);
      let clickedTabName = Ember.$(e.currentTarget).attr('data-tab');

      Ember.set(this, `_activeTabs.${tabModelName}`, clickedTabName);
    },

    /**
      Handles attributes row selection.

      @method actions.onRowSelect
      @param {Object} tabModel Related tab.
      @param {String} rowId Selected row identifier.
      @param {Object} options Selection options.
    */
    onRowSelect(tabModel, rowId, options) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      Ember.set(selectedRows, rowId, options.checked);
      Ember.set(tabModel, '_selectedRows', selectedRows);
      tabModel.notifyPropertyChange('_selectedRows');
    },

    /**
      Handles 'Find an item on the map' button click.

      @method actions.onFindItemClick
      @param {Object} tabModel Related tab.
    */
    onFindItemClick(tabModel) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let selectedFeatures = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
        .map((key) => {
          return tabModel.featureLink[key].feature;
        });

      this._foldTabs();
      this.send('zoomTo', selectedFeatures);
    },

    /**
      Handles 'Find an item on the map' button click.

      @method actions.onFindItem
      @param {Object} tabModel Related tab.
    */
    onFindItem(tabModel, rowId) {
      let selectedFeature = tabModel.featureLink[rowId].feature;
      this.send('zoomTo', [selectedFeature]);
      this._foldTabs();
    },

    /**
      Handles units dropdown clicks.

      @method actions.onUnitSelected
      @param {String} item Clicked item locale key.
      @param {String} key Clicked item value.
    */
    onUnitSelected(item, key) {
      this.set('_selectedUnit', key);
    },

    /**
      Handles 'Draw buffer' button click.

      @method actions.drawBuffer
      @param {Object} tabModel Related tab.
    */
    drawBuffer(tabModel) {
      this.send('deleteBuffer', tabModel);

      let radius = this.get('_radius');
      let unit = this.get('_selectedUnit');
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let leafletMap = this.get('leafletMap');
      let _bufferLayer = this.get('_bufferLayer');
      if (Ember.isNone(_bufferLayer)) {
        _bufferLayer = L.featureGroup();
        leafletMap.addLayer(_bufferLayer);
      }

      Object.keys(selectedRows).forEach(key => {
        let item = tabModel.featureLink[key].feature.leafletLayer.toGeoJSON();
        let prop = Object.assign({}, item.properties);
        item.properties = prop;
        let buf = buffer.default(item, radius, { units: unit });
        _bufferLayer.addLayer(L.geoJSON(buf, { key: key }));
      });

      this.set('_bufferLayer', _bufferLayer);

      this.send('onFindItemClick', tabModel);
    },

    /**
      Handles 'Delete buffer' button click.

      @method actions.deleteBuffer
    */
    deleteBuffer(tabModel) {
      let _bufferLayer = this.get('_bufferLayer');
      if (Ember.isNone(_bufferLayer)) {
        return;
      }

      let selectedRows = Ember.get(tabModel, '_selectedRows');
      Object.keys(selectedRows).forEach(key => {
        if (selectedRows[key]) {
          Object.values(_bufferLayer._layers).forEach(layer => {
            if (layer.options.key === key) {
              _bufferLayer.removeLayer(layer);
            }
          });
        }
      });
    },

    /**
      Handles 'Clear found items' button click.

      @method actions.onClearFoundItemClick
    */
    onClearFoundItemClick() {
      let serviceLayer = this.get('serviceLayer');
      if (!Ember.isNone(serviceLayer)) {
        serviceLayer.clearLayers();
      }
    },

    /**
      Handles find intersecting polygons.
      @method actions.onFindIntersectPolygons
    */
    onFindIntersectPolygons(tabModel) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let selectedFeaturesKeys = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item));
      let intersectPolygonFeatures = Ember.A();
      let intersectPolygonFeaturesKeys = Ember.A();
      selectedFeaturesKeys.forEach((item, index) => {
        let currentFeature = tabModel.featureLink[item].feature;
        let currentFeatureGeoJson = currentFeature.leafletLayer.toGeoJSON();
        let currentFeatureGeometry = currentFeatureGeoJson.geometry;
        let isIntersect = !Ember.isNone(currentFeatureGeometry) ? checkIntersect(currentFeatureGeometry) : false;

        if (isIntersect) {
          intersectPolygonFeaturesKeys.push(item);
          intersectPolygonFeatures.push(currentFeature);
        }
      });

      if (intersectPolygonFeatures.length !== 0) {
        Ember.set(tabModel, '_selectedRows', {});
        Ember.set(tabModel, 'selectAll', false);
        let selectedInterctItemsRows = Ember.get(tabModel, '_selectedRows');
        intersectPolygonFeaturesKeys.forEach((item, index) => {
          Ember.set(selectedInterctItemsRows, item, true);
        });
        Ember.set(tabModel, '_selectedRows', selectedInterctItemsRows);
        this.send('zoomTo', intersectPolygonFeatures);
      }
    },
    /**
      Handles 'Select all' checkbox click.

      @method actions.onSelectAllClick
      @param {Object} tabModel Related tab.
    */
    onSelectAllClick(tabModel) {
      this.changeSelectedAll(tabModel, !Ember.get(tabModel, 'selectAll'));
    },

    /**
      Handles 'getData' action from flexberry-table.

      @method actions.onTabGetData
      @param {Object} tabModel
      @param {Object} options
    */
    onTabGetData(tabModel, options) {
      Ember.set(tabModel, '_skip', options.skip);
      Ember.set(tabModel, '_top', options.top);
    },

    /**
      Handles tab panel moving.

      @method actions.onTabMove
      @param {Boolean} left Flag: indicates whether move direction is left or not.
    */
    onTabMove(left) {
      // move tabs bar on the left or on the right
      let offset = this.get('_featureTabsOffset');
      if (left) {
        if (offset > 0) {
          offset -= Math.min(25, offset);
        }
      } else {
        let panelWidth = Ember.$('.bottompanel-tab-nav-panel-tabs').innerWidth();
        let itemsWidth = 0;
        const navButtonWidth = 25;
        Ember.$('.bottompanel-tab-nav-panel-tabs').children().each((index, item) => {
          itemsWidth += Ember.$(item).outerWidth();
        });
        let offsetDelta = Math.min(25, (panelWidth >= itemsWidth ? 0 :
          (offset >= itemsWidth - panelWidth + navButtonWidth ? 0 :
            itemsWidth - panelWidth + navButtonWidth - offset)));
        offset += offsetDelta;
      }

      this.set('_featureTabsOffset', offset);
      Ember.$('.bottompanel-tab-nav-panel-tabs').css('left', `-${offset}px`);
    },

    onDeleteRowDialogDeny() {
      this.set('_deleteRowDialogIsVisible', false);
      this.set('_deleteRowDialogHasBeenRequested', false);
    },

    onDeleteRowDialogApprove() {
      this.set('_deleteRowDialogIsVisible', false);

      let tabModel = this.get('_deleteRowTabModel');
      if (Ember.isNone(tabModel)) {
        return;
      }

      this.set('_deleteRowTabModel', null);

      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let editedRows = Ember.get(tabModel, '_editedRows');

      let mapModelApi = this.get('mapApi').getFromApi('mapModel');
      let selectedFeatureIds = Object.keys(selectedRows).map((key) => {
        let id = mapModelApi._getLayerFeatureId(tabModel.layerModel, tabModel.featureLink[key]);
        return id;
      });

      let leafletMap = this.get('leafletMap');
      leafletMap.fire('flexberry-map:delete-feature:start', { ids: selectedFeatureIds });

      let selectedFeatureKeys = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item));
      selectedFeatureKeys.forEach((key) => {
        this._deleteLayerByKey(tabModel, key, selectedRows, editedRows);
      });

      this.send('onClearFoundItemClick');

      let leafletObject = tabModel.leafletObject;

      let saveFailed = (data) => {
        // тут бы восстановить слои
        this.set('loading', false);
        this.set('error', data);
        leafletObject.off('save:success', saveSuccess);
      };

      let saveSuccess = (data) => {
        this.set('loading', false);
        tabModel._reload();
        leafletObject.off('save:failed', saveFailed);
      };

      this.set('loading', true);
      leafletObject.once('save:failed', saveFailed);
      leafletObject.once('save:success', saveSuccess);
      leafletObject.save();
    },

    /**
      Handles 'Delete selected items' button click.

      @method actions.onDeleteItemClick
      @param {Object} tabModel Related tab.
    */
    onDeleteItemClick(tabModel) {
      this.set('_deleteRowDialogHasBeenRequested', true);
      this.set('_deleteRowDialogIsVisible', true);
      this.set('_deleteRowTabModel', tabModel);
    },

    /**
      Performs row editing.

      @method actions.onRowEdit
      @param {Object} tabModel Related tab.
      @param {Object} rowId Editing row identifier.
    */
    onRowEdit(tabModel, rowId) {
      let editedProperty = tabModel.propertyLink[rowId];

      let dataItems = {
        mode: 'Edit',
        items: [{
          data: Object.assign({}, editedProperty),
          initialData: editedProperty,
          layer: tabModel.featureLink[rowId],
        }]
      };

      this.sendAction('editFeature', {
        isFavorite: true, // проще чтобы проверилось непосредственно в избранном
        dataItems: dataItems,
        layerModel: tabModel,
        settings: tabModel.settings
      });

      this._foldTabs();
    },

    /**
      Handles a new geometry adding by import completion.

      @param {Object} tabModel Related tab model.
      @param {Object} addedLayers Added layer.
    */
    onImportComplete(tabModel, addedLayers) {
      let fields = Ember.get(tabModel, 'leafletObject.readFormat.featureType.fields');

      let items = [];
      addedLayers.forEach((layer) => {
        let properties = Object.keys(fields).reduce((result, item) => {
          result[item] = null;
          return result;
        }, {});

        Object.keys(layer.feature.properties).forEach((key) => {
          Ember.set(properties, key, layer.feature.properties[key]);
        });

        items.push({
          data: properties,
          layer: layer
        });
      });

      let dataItems = {
        mode: 'Import',
        items: items
      };

      this.sendAction('editFeature', {
        dataItems: dataItems,
        layerModel: tabModel,
        settings: tabModel.settings
      });

      this._foldTabs();
    },

    /**
      Handles click on 'Difference polygon' button.

      @param {Object} tabModel Related tab model.
    */
    onDifferenceClick(tabModel) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let selectedFeatures = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
        .map((key) => {
          let feature = tabModel.featureLink[key].feature;
          let layer = feature.leafletLayer.toGeoJSON();
          if ((layer.geometry.type === 'Polygon') || (layer.geometry.type === 'MultiPolygon')) {
            return layer;
          }

          delete selectedRows[key];
        }).filter((item) => !Ember.isNone(item));

      if (selectedFeatures.length < 1) {
        return;
      }

      if (Ember.isNone(this.get('_dataForDifference'))) {
        this.set('_dataForDifference', selectedRows);
        this.changeSelectedAll(tabModel, false);

        // Create function for observer.
        let _this = this;
        tabModel._typeSelectedRowsObserverForDifference = function () {
          let typeSelectedRows = this.get('_typeSelectedRows');
          if (typeSelectedRows.polygon > 0 || typeSelectedRows.multiPolygon > 0) {
            _this.send('onDifferenceClick', tabModel);
          }
        };

        Ember.addObserver(tabModel, '_typeSelectedRows', null, tabModel._typeSelectedRowsObserverForDifference);
      } else {
        // Remove observer and function.
        Ember.removeObserver(tabModel, '_typeSelectedRows', null, tabModel._typeSelectedRowsObserverForDifference);
        tabModel._typeSelectedRowsObserverForDifference = undefined;

        let geojsonReader = new jsts.io.GeoJSONReader();

        // Find intersecting polygons with splitter.
        let dataForDifference = this.get('_dataForDifference');
        let intersectingFeatures = Object.keys(dataForDifference).filter((item) => Ember.get(dataForDifference, item))
          .map((key) => {
            let feature = tabModel.featureLink[key].feature;
            let layer = feature.leafletLayer.toGeoJSON();

            let firstObjectJstsGeom = geojsonReader.read(layer.geometry);
            let secondObjectJstsGeom = geojsonReader.read(selectedFeatures[0].geometry);

            if (!firstObjectJstsGeom.equalsNorm(secondObjectJstsGeom)) {
              let intersection = firstObjectJstsGeom.intersection(secondObjectJstsGeom);
              let geojsonWriter = new jsts.io.GeoJSONWriter();
              let intersectionRes = geojsonWriter.write(intersection);

              if (!Ember.isNone(intersectionRes)) {
                return layer;
              }
            }

            delete dataForDifference[key];
          }).filter((item) => !Ember.isNone(item));

        let items = [];

        intersectingFeatures.forEach((feature) => {
          let firstObjectJstsGeom = geojsonReader.read(feature.geometry);
          let secondObjectJstsGeom = geojsonReader.read(selectedFeatures[0].geometry);

          let nonIntersection = firstObjectJstsGeom.difference(secondObjectJstsGeom);
          let geojsonWriter = new jsts.io.GeoJSONWriter();
          let differenceResult = geojsonWriter.write(nonIntersection);

          let leafletLayer = L.geoJSON(differenceResult).getLayers();

          items.push({
            data: Object.assign({}, feature.properties),
            layer: leafletLayer[0]
          });
        });

        this.set('_dataForDifference', null);

        if (items.length < 1) {
          let i18n = this.get('i18n');
          alert(i18n.t(('components.flexberry-layers-attributes-panel.spliter-error')));
          return;
        }

        let selectedLayers = Object.keys(dataForDifference).map((key) => {
          return tabModel.featureLink[key];
        }).filter((item) => !Ember.isNone(item));

        let dataItems = {
          mode: 'Diff',
          items: items,
          initialLayers: selectedLayers, // нужны для удаления
          initialFeatureKeys: Object.keys(dataForDifference)
        };

        this.sendAction('editFeature', {
          dataItems: dataItems,
          layerModel: tabModel,
          settings: tabModel.settings
        });

        this.changeSelectedAll(tabModel, false);
        this._foldTabs();
      }
    },

    /**
      Handles click on 'Split geometry' button.

      @param {Object} tabModel Related tab model.
    */
    onSplitGeometry(tabModel) {
      let leafletMap = this.get('leafletMap');
      leafletMap.flexberryMap.tools.enableDefault();

      this.send('onFindItemClick', tabModel);

      let editTools = this._getEditTools();
      editTools.off('editable:drawing:end', this._disableDrawSplitGeometry, [tabModel, this]);
      editTools.on('editable:drawing:end', this._disableDrawSplitGeometry, [tabModel, this]);
      editTools.startPolyline();
    },

    /**
      Handles click on 'Union polygon' button.

      @method actions.doCombinedPolygon
      @param {Object} tabModel Related tab.
    */
    doCombinedPolygon(tabModel) {
      // собираем геометрию у выделенных объектов
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let selectedFeatures = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
        .map((key) => {
          let feature = tabModel.featureLink[key].feature;
          let layer = feature.leafletLayer.toGeoJSON();
          if ((layer.geometry.type === 'Polygon') || (layer.geometry.type === 'MultiPolygon')) {
            return layer;
          }

          delete selectedRows[key];
        }).filter((item) => !Ember.isNone(item));

      let selectedLayers = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).map((key) => {
        let feature = tabModel.featureLink[key].feature;
        let layer = feature.leafletLayer.toGeoJSON();
        if ((layer.geometry.type === 'Polygon') || (layer.geometry.type === 'MultiPolygon')) {
          return tabModel.featureLink[key];
        }
      }).filter((item) => !Ember.isNone(item));

      // если подходящих действительно несколько, то собираем в один новый мультиполигон
      if (selectedFeatures.length > 1) {
        let geojsonReader = new jsts.io.GeoJSONReader();
        let combinedPolygon = geojsonReader.read(selectedFeatures[0].geometry);
        for (var i = 1; i < selectedFeatures.length; i++) {
          combinedPolygon = combinedPolygon.union(geojsonReader.read(selectedFeatures[i].geometry));
        }

        let geojsonWriter = new jsts.io.GeoJSONWriter();

        let leafletLayers = L.geoJSON(geojsonWriter.write(combinedPolygon));
        let polygonLayers = leafletLayers.getLayers();

        // готовим данные для выбора
        let layerProperties = [];
        selectedFeatures.forEach((layer) => {
          layerProperties.push(Object.assign({}, layer.properties));
        });

        // готовим пустые данные
        let fields = Ember.get(tabModel, 'leafletObject.readFormat.featureType.fields');
        let data = Object.keys(fields).reduce((result, item) => {
          result[item] = null;
          return result;
        }, {});

        let dataItems = {
          mode: 'Union',
          items: [{
            data: data,
            layer: polygonLayers[0]
          }],
          choiceValueData: layerProperties,
          initialLayers: selectedLayers, // нужны для удаления
          initialFeatureKeys: Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
        };

        this.sendAction('editFeature', {
          dataItems: dataItems,
          layerModel: tabModel,
          settings: tabModel.settings
        });

        this._foldTabs();
      }
    },
  },

  /**
    Selected or deselected all objects.

    @param {Object} tabModel Tab model.
    @param {Boolean} selectedFlag Indicates select or deselect objects.
  */
  changeSelectedAll(tabModel, selectedFlag) {
    let selectAll = Ember.get(tabModel, 'selectAll');
    if (!Ember.isNone(selectedFlag)) {
      Ember.set(tabModel, 'selectAll', selectedFlag);
      selectAll = selectedFlag;
    }

    if (!selectAll) {
      Ember.set(tabModel, '_selectedRows', {});
    } else {
      let selectedRows = Object.assign(...Object.keys(Ember.get(tabModel, 'propertyLink')).map(k => ({
        [k]: true
      })));
      Ember.set(tabModel, '_selectedRows', selectedRows);
    }

    tabModel.notifyPropertyChange('_selectedRows');
  },

  /**
    Treatment selected and edited rows.

    @param {Object} tabModel Tab model.
    @param {Boolean} func Processing function.
  */
  _treatmentSelectedEditedRows(tabModel, func) {
    let selectedRows = Ember.get(tabModel, '_selectedRows');
    let editedRows = Ember.get(tabModel, '_editedRows');

    func(selectedRows, editedRows);
  },

  /**
    Delete layer feature by id.

    @param {String} featureId Layer feature id.
    @param {String} layer Layer to delete from.
  */
  _deleteLayerById(featureId, layer) {
    let tabModels = this.get('_tabModels');

    if (!Ember.isNone(tabModels)) {
      for (let i = 0; i < tabModels.length; i++) {
        let tabModel = tabModels[i];

        let treatmentSelectedEditedRows = function (selectedRows, editedRows) {
          for (let key in tabModel.featureLink) {
            let id;
            const getLayerFeatureIdFunc = this.get('mapApi').getFromApi('getLayerFeatureId');
            if (typeof getLayerFeatureIdFunc === 'function') {

              //Need to implement id definition function
              id = getLayerFeatureIdFunc(Ember.get(tabModel, `featureLink.${key}`));
            } else {
              id = Ember.get(tabModel, `featureLink.${key}.feature.id`);
            }

            if (id === featureId) {
              this._deleteLayerByKey(tabModel, key, selectedRows, editedRows);
            }
          }
        }.bind(this);

        this._treatmentSelectedEditedRows(tabModel, treatmentSelectedEditedRows);
      }
    }
  },

  /**
    Disables tool and split geometry.

    @param {Object} e Event object.
  */
  _disableDrawSplitGeometry(e) {
    let [tabModel, _this] = this;

    let selectedRows = Ember.get(tabModel, '_selectedRows');
    let selectedFeatures = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
      .map((key) => {
        let feature = tabModel.featureLink[key].feature;
        let layer = feature.leafletLayer.toGeoJSON();
        if ((layer.geometry.type !== 'LineString') && (layer.geometry.type !== 'MultiLineString') &&
          (layer.geometry.type !== 'Polygon') && (layer.geometry.type !== 'MultiPolygon')) {
          delete selectedRows[key];
          return;
        }

        return layer;
      }).filter((item) => !Ember.isNone(item));

    let editTools = _this._getEditTools();
    editTools.off('editable:drawing:end', _this._disableDrawSplitGeometry, this);
    editTools.stopDrawing();

    let editLayer = editTools.editLayer;
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
    }

    let featuresLayer = editTools.featuresLayer;
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
    }

    let splitLine = e.layer.toGeoJSON();
    let kinksPoint = kinks.default(splitLine);
    if (kinksPoint.features.length !== 0) {
      _this.set('error', new Error('Splitting line has self-intersections'));
      return;
    }

    let items = [];
    selectedFeatures.forEach((layer) => {
      let split = helper.default.featureCollection([]);
      switch (layer.geometry.type) {
        case 'LineString':
          split = lineSplit.default(layer, splitLine);
          break;
        case 'MultiLineString': //TODO Need TEST!!!!!
          let arrayLineString = layer.geometry.coordinates;
          let resultLineString = [];
          arrayLineString.forEach((line) => {
            let lineSplitResult = lineSplit.default(helper.default.lineString(line), splitLine);
            resultLineString = resultLineString.concat(lineSplitResult.features);
          });

          split = helper.default.featureCollection(resultLineString);
          break;
        case 'Polygon':
          let resultSplit = _this._polygonSplit(layer, splitLine);
          if (resultSplit.length > 1) {
            split = helper.default.featureCollection(resultSplit);
          }

          break;
        case 'MultiPolygon':
          let arrayPolygons = layer.geometry.coordinates;
          let resultPolygonSplit = [];
          arrayPolygons.forEach((polygon) => {
            resultPolygonSplit = resultPolygonSplit.concat(_this._polygonSplit(helper.default.polygon(polygon), splitLine));
          });

          if (arrayPolygons.length <= resultPolygonSplit.length) {
            split = helper.default.featureCollection(resultPolygonSplit);
          }

          break;
      }

      if (split.features.length === 0) {
        let selectedRows = Ember.get(tabModel, '_selectedRows');
        let key = Ember.guidFor(layer.properties);
        delete selectedRows[key];
      }

      split.features.forEach((splitResult) => {
        let leafletLayer = L.geoJSON(splitResult).getLayers();
        items.push({
          data: Object.assign({}, layer.properties),
          layer: leafletLayer[0]
        });
      });
    });

    if (items.length === 0) {
      return;
    }

    selectedRows = Ember.get(tabModel, '_selectedRows');
    let selectedLayers = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).map((key) => {
      return tabModel.featureLink[key];
    }).filter((item) => !Ember.isNone(item));

    let dataItems = {
      mode: 'Split',
      items: items,
      initialLayers: selectedLayers, // нужны для удаления
      initialFeatureKeys: Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
    };

    _this.sendAction('editFeature', {
      dataItems: dataItems,
      layerModel: tabModel,
      settings: tabModel.settings
    });
  },

  /**
    Split splitter and split polygon each part splitter.

    @param {Object} layer polygon.
    @param {Object} laysplitLineer splitter.
  */
  _polygonSplit(layer, splitLine) {
    let arraySplitLine = [];
    let i = 0;
    let waitEndPoint = false;
    let startPoint;

    // We divide line of the user.
    // If used lineSplit, resulting lines will not cross the polygon line, so we use while.
    while (i !== splitLine.geometry.coordinates.length) {
      let point = helper.default.point(splitLine.geometry.coordinates[i]);
      if (!booleanWithin.default(point, layer) && !waitEndPoint) {
        if (!Ember.isNone(startPoint) && lineIntersect.default(layer, lineSlice.default(startPoint, point, splitLine)).features.length > 0) {
          let resultlineIntersect = lineIntersect.default(layer, lineSlice.default(startPoint, point, splitLine));
          if (resultlineIntersect.features.length === 2) {
            arraySplitLine.push(lineSlice.default(startPoint, point, splitLine));
          } else {
            for (let j = 1; j < resultlineIntersect.features.length - 1; j = j + 2) {
              let intersectPointStart = resultlineIntersect.features[j];
              let intersectPointEnd = resultlineIntersect.features[j + 1];
              let intersectMidPoint = midpoint.default(intersectPointStart, intersectPointEnd);
              arraySplitLine.push(lineSlice.default(startPoint, intersectMidPoint, splitLine));
              startPoint = intersectMidPoint;
            }

            arraySplitLine.push(lineSlice.default(startPoint, point, splitLine));
          }
        }

        startPoint = point;
      } else if (booleanWithin.default(point, layer)) {
        waitEndPoint = true;
      } else if (waitEndPoint) {
        let resultlineIntersect = lineIntersect.default(layer, lineSlice.default(startPoint, point, splitLine));
        if (resultlineIntersect.features.length > 2) {
          for (let j = 1; j < resultlineIntersect.features.length - 1; j = j + 2) {
            let intersectPointStart = resultlineIntersect.features[j];
            let intersectPointEnd = resultlineIntersect.features[j + 1];
            let intersectMidPoint = midpoint.default(intersectPointStart, intersectPointEnd);
            arraySplitLine.push(lineSlice.default(startPoint, intersectMidPoint, splitLine));
            startPoint = intersectMidPoint;
          }
        }

        arraySplitLine.push(lineSlice.default(startPoint, point, splitLine));
        startPoint = point;
        waitEndPoint = false;
      }

      i++;
    }

    let arrayPolygon = [layer];
    arraySplitLine.forEach((line) => {
      let intersectingPolygon = arrayPolygon.filter((item) => lineIntersect.default(item, line).features.length > 1);
      intersectingPolygon.forEach((polygon) => {
        let arraySplitPolygon = this._lineSplitPolygon(polygon, line);
        let position = arrayPolygon.indexOf(polygon);
        arrayPolygon.splice(position, 1);
        arrayPolygon = arrayPolygon.concat(arraySplitPolygon);
      });
    });

    return arrayPolygon;
  },

  /**
    Split polygon.

    @param {Object} polygon polygon to split.
    @param {Object} line splitter.
  */
  _lineSplitPolygon(polygon, line) {
    let lineFromPolygon = polygonToLine.default(polygon);
    let startPolygonPoint = helper.default.point(lineFromPolygon.geometry.coordinates[0]);
    let splitByPoint = booleanWithin.default(startPolygonPoint, line);
    let arraySplitLine = lineSplit.default(lineFromPolygon, line);

    if (!splitByPoint) {
      let firstPartLine = invariant.default.getCoords(arraySplitLine.features[0]);
      let secondPartLine = invariant.default.getCoords(arraySplitLine.features[arraySplitLine.features.length - 1]);
      firstPartLine.shift();
      arraySplitLine.features.shift();
      arraySplitLine.features.pop();
      let combinePolygonLine = secondPartLine.concat(firstPartLine);
      arraySplitLine.features.push(helper.default.lineString(combinePolygonLine));
    }

    // Intersection points of the polygon and the line of division.
    let intersectingPoints = lineIntersect.default(line, lineFromPolygon);
    let polygonSide = lineSlice.default(intersectingPoints.features[0], intersectingPoints.features[1], line);
    let polygonSideCoords = invariant.default.getCoords(polygonSide);

    // Delete duplicates point.
    let uniqueValue = [];
    polygonSideCoords.forEach((polygonLine) => {
      if (!uniqueValue.includes(polygonLine)) {
        uniqueValue.push(polygonLine);
      }
    });

    // Because lineSlice not include intersection points. We replace start and end point.
    uniqueValue.splice(0, 1, invariant.default.getCoords(intersectingPoints.features[0]));
    uniqueValue.splice(uniqueValue.length - 1, 1, invariant.default.getCoords(intersectingPoints.features[1]));

    let polygons = [];
    arraySplitLine.features.forEach((polygonLine) => {

      // Add line points to polygon.
      let coordsSide = uniqueValue;
      let coordsPolygonLine = invariant.default.getCoords(polygonLine);
      let startPointPolygonLine = helper.default.point(coordsPolygonLine[0]);
      let endPointPolygonLine = helper.default.point(coordsPolygonLine[coordsPolygonLine.length - 1]);
      let pointSide = helper.default.point(coordsSide[0]);
      let distanceSideAndStartPoint = distance.default(startPointPolygonLine, pointSide);
      let distanceSideAndEndPoint = distance.default(endPointPolygonLine, pointSide);

      if (distanceSideAndEndPoint > distanceSideAndStartPoint) {
        coordsPolygonLine = coordsSide.reverse().concat(coordsPolygonLine);
      }

      if (distanceSideAndEndPoint < distanceSideAndStartPoint) {
        coordsPolygonLine = coordsPolygonLine.concat(coordsSide);
      }

      polygons.push(lineToPolygon.default(helper.default.lineString(coordsPolygonLine)));
    });

    return polygons;
  },

  /**
    Zooms map to the specified layer.

    @param {Object} layer
  */
  _zoomToLayer(layer) {
    this.send('zoomTo', [layer.feature]);
    this.send('onClearFoundItemClick');
  }
});
