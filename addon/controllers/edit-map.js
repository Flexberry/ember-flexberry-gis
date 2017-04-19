/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormController from 'ember-flexberry/controllers/edit-form';
import FlexberryMapActionsHandlerMixin from '../mixins/flexberry-map-actions-handler';
import FlexberryMaplayerActionsHandlerMixin from '../mixins/flexberry-maplayer-actions-handler';

/**
  Edit map controller.

  @class EditMapController
  @extends EditFormController
  @uses FlexberryMapActionsHandlerMixin
  @uses FlexberryMaplayerActionsHandlerMixin
*/
export default EditFormController.extend(
  FlexberryMapActionsHandlerMixin,
  FlexberryMaplayerActionsHandlerMixin, {
    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    queryParams: ['geofilter'],

    /**
      Query parameter, contains json serialized object with property names and values
      @property filter
      @type String
      @default null
     */
    geofilter: null,

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
    },
  });
