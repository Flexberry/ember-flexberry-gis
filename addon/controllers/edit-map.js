/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormController from 'ember-flexberry/controllers/edit-form';
import FlexberryMapActionsHandlerMixin from '../mixins/flexberry-map-actions-handler';
import FlexberryMaplayerActionsHandlerMixin from '../mixins/flexberry-maplayer-actions-handler';
import FlexberryLayersActionsHandlerMixin from '../mixins/flexberry-layers-action-handler';
import LayerResultListActionsHandlerMixin from '../mixins/layer-result-list-actions-handler';
import LocalStorageBindingMixin from '../mixins/local-storage-binding';
import FavoritesListMixin from '../mixins/favorites-features';

/**
  Edit map controller.

  @class EditMapController
  @extends EditFormController
  @uses FlexberryMapActionsHandlerMixin
  @uses FlexberryMaplayerActionsHandlerMixin
  @uses LayerResultListActionsHandlerMixin
  @uses LocalStorageBindingMixin
*/
export default EditFormController.extend(
  FlexberryMapActionsHandlerMixin,
  FlexberryMaplayerActionsHandlerMixin,
  FlexberryLayersActionsHandlerMixin,
  LayerResultListActionsHandlerMixin,
  LocalStorageBindingMixin,
  FavoritesListMixin, {
    /**
      Observes handles changes in showComapreGeometriesPanel property.
      If Comapre Geometries Panel is active bring in to front.

      @method comapreGeometriesPanelObserver
      @private
    */
    _comapreGeometriesPanelObserver: Ember.observer('showComapreGeometriesPanel', function () {
      if (this.get('showComapreGeometriesPanel')) {
        Ember.$('.bottom-compare-panel').css('z-index', 2000);
        Ember.$('.bottom-intersection-panel').css('z-index', 1999);
        Ember.$('.bottom-attributes-panel').css('z-index', 1998);
      }
    }),

    /**
      Observes handles changes in showIntersectionPanel property.
      If Intersectio nPanel is active bring in to front.

      @method intersectionPanelObserver
      @private
    */
    _intersectionPanelObserver: Ember.observer('showIntersectionPanel', function () {
      if (this.get('showIntersectionPanel')) {
        Ember.$('.bottom-intersection-panel').css('z-index', 2000);
        Ember.$('.bottom-compare-panel').css('z-index', 1999);
        Ember.$('.bottom-attributes-panel').css('z-index', 1998);
      }
    }),
    /**
      Observes handles changes in editedLayers.length property.
      If Attributes Panel is active bring in to front.

      @method attributesPanelObserver
      @private
    */
    _attributesPanelObserver: Ember.observer('editedLayers.length', function () {
      if (this.get('editedLayers.length') > 0) {
        Ember.$('.bottom-attributes-panel').css('z-index', 2000);
        Ember.$('.bottom-intersection-panel').css('z-index', 1999);
        Ember.$('.bottom-compare-panel').css('z-index', 1998);
      }
    }),

    /**
      Flag indicates if comapre tool active.

      @property compareLayersEnabled
      @type Boolean
      @default false
    */
    compareLayersEnabled: false,

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    queryParams: ['geofilter', 'setting', 'zoom', 'lat', 'lng', 'metadata'],

    /**
      Query parameter, contains json serialized object with property names and values
      @property filter
      @type String
      @default null
     */
    geofilter: null,

    /**
      Is intersection panel enabled.
      @property setting
      @type Boolean
      @default false
    */
    showIntersectionPanel: false,

    /**
      Query parameter, contains map object setting primary key
      @property setting
      @type String
      @default null
    */
    setting: null,

    /**
      Query parameter, contains current map zoom
      @property zoom
      @type String
      @default null
    */
    zoom: null,

    /**
      Query parameter, contains current map latitude
      @property lat
      @type String
      @default null
    */
    lat: null,

    /**
      Query parameter, contains current map longitude
      @property lng
      @type String
      @default null
    */
    lng: null,

    /**
      Query parameter, contains comma-separated ids
      of selected layer metadata
      @property metadata
      @type String
      @default null
    */
    metadata: null,

    /**
      Deserialized valued of filter property
      @property queryFilter
      @type object
      @computed
     */
    queryFilter: Ember.computed('geofilter', function () {
      let filter = this.get('geofilter');
      if (!Ember.isNone(filter)) {
        try {
          return JSON.parse(filter);
        } catch (e) {
          console.log('Wrong JSON query filter string: ' + filter);
        }
      }

      return null;
    }),

    /**
      Class name used which will be used to save data in local storage.

      @property bindingClass
      @type String
      @default 'layers'
    */
    bindingClass: 'layers',

    /**
      Key property used which will be used to save data in local storage.

      @property keyProperty
      @type String
      @default 'model.id'
    */
    keyProperty: 'model.id',

    /**
      Object containing bindings as key-value pairs.

      @property binding
      @type Object
      @example
      ```javascript
      binding: {
        visibility: 'visibility',
        opacity: 'settingsAsObject.opacity'
      },
      ```
    */
    binding: {
      visibility: 'visibility',
      opacity: 'settingsAsObject.opacity'
    },

    /**
      This method will be invoked before save operation will be called.
      Override this method to add some custom logic on save operation start.

      @example
        ```javascript
        onSaveActionStarted() {
          alert('Save operation started!');
        }
        ```
      @method onSaveActionStarted.
    */
    onSaveActionStarted() {
      this._super(...arguments);
      let model = this.get('model');
      let urlParams = ['zoom', 'lat', 'lng'];
      let currentParam;
      urlParams.forEach((param) => {
        currentParam = this.get(param);
        if (!Ember.isBlank(currentParam)) {
          model.set(param, currentParam);
        }
      }, this);
    },

    /**
      Creates new layer as specified layer's child
      (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:createLayer:method"}}
      FlexberryMaplayerActionsHandlerMixin
      {{/crossLink}}).

      @method createLayer
      @param {Object} options Method options.
      @param {String} options.parentLayerPath Path to parent layer.
      @param {String} options.parentLayer Parent layer.
      @param {Object} options.layerProperties Object containing new layer properties.
      @returns {Object} Created layer.
      @private
    */
    createLayer(options) {
      options = options || {};
      let parentLayer = Ember.get(options, 'parentLayer');
      let layerProperties = Ember.get(options, 'layerProperties');

      let store = this.get('store');
      let layer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', layerProperties);
      layer.set('parent', parentLayer);

      return layer;
    },

    /**
      Updates specified layer with given properties.
      (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:editLayer:method"}}
      FlexberryMaplayerActionsHandlerMixin
      {{/crossLink}}).

      @method editLayer
      @param {Object} options Method options.
      @param {String} options.layerPath Path to editing layer.
      @param {String} options.layer Editing layer.
      @param {Object} options.layerProperties Object containing edited layer properties.
      @returns {Object} Edited layer.
      @private
    */
    editLayer(options) {
      return this._super(...arguments);
    },

    /**
      Removes specified layer from layers hierarchy
      (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:/removeLayer:method"}}
      FlexberryMaplayerActionsHandlerMixin
      {{/crossLink}}).

      @method removeLayer
      @param {Object} options Method options.
      @param {String} options.layerPath Path to removing layer.
      @param {String} options.layer Removing layer itself.
      @returns {Object} Removed layer.
      @private
    */
    removeLayer(options) {
      options = options || {};
      let layer = Ember.get(options, 'layer');

      if (!Ember.isNone(layer)) {
        layer.deleteRecord();
      }

      let layers = Ember.get(layer, 'layers');
      if (Ember.isArray(layers)) {
        layers.forEach((childLayer) => {
          this.removeLayer({
            layer: childLayer
          });
        });
      }

      return layer;
    }
  });
