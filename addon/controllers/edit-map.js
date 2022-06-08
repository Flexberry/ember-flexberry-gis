/**
  @module ember-flexberry-gis
*/

import { isArray } from '@ember/array';

import $ from 'jquery';
import { isNone, isBlank } from '@ember/utils';
import { computed, get } from '@ember/object';
import EditFormController from 'ember-flexberry/controllers/edit-form';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
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
    queryFilter: computed('geofilter', function () {
      const filter = this.get('geofilter');
      if (!isNone(filter)) {
        try {
          return JSON.parse(filter);
        } catch (e) {
          console.error(`Wrong JSON query filter string: ${filter}`);
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
    binding: null,

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
      const model = this.get('model');
      const urlParams = ['zoom', 'lat', 'lng'];
      let currentParam;
      urlParams.forEach((param) => {
        currentParam = this.get(param);
        if (!isBlank(currentParam)) {
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
      const parentLayer = get(options, 'parentLayer');
      const layerProperties = $.extend({ id: generateUniqueId(), }, get(options, 'layerProperties'));

      const store = this.get('store');
      const layer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', layerProperties);
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
    editLayer() {
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
      const layer = get(options, 'layer');

      if (!isNone(layer)) {
        layer.deleteRecord();
      }

      const layers = get(layer, 'layers');
      if (isArray(layers)) {
        layers.forEach((childLayer) => {
          this.removeLayer({
            layer: childLayer,
          });
        });
      }

      return layer;
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);
      this.binding = this.binding || {
        visibility: 'visibility',
        opacity: 'settingsAsObject.opacity',
      };
    },
  }
);
