import Ember from 'ember';
import EditFormController from 'ember-flexberry/controllers/edit-form';
import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayer-actions-handler';

export default EditFormController.extend(FlexberryMaplayerActionsHandlerMixin, {
 actions: {
    updateCenter(e) {
      let center = e.target.getCenter();
      this.set('model.lat', center.lat);
      this.set('model.lng', center.lng);
    },

    leafletMapDidInit(leafletMap) {
      this.set('leafletMap', leafletMap);
    }
  },

  /**
    Creates new layer as specified layer's child
    (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:_createLayer:method"}}
    FlexberryMaplayerActionsHandlerMixin
    {{/crossLink}}).

    @method _createLayer
    @param {Object} options Method options.
    @param {String} options.parentLayerPath Path to parent layer.
    @param {String} options.parentLayer Parent layer.
    @param {Object} options.layerProperties Object containing new layer properties.
    @returns {Object} Created layer.
    @private
  */
  _createLayer(options) {
    options = options || {}; 
    let parentLayer = Ember.get(options, 'parentLayer');
    let layerProperties = Ember.get(options, 'layerProperties');

    let store = this.get('store');
    let layer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', layerProperties);
    parentLayer.set('parent', layer);

    return layer;
  },

  /**
    Updates specified layer with given properties.
    (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:_editLayer:method"}}
    FlexberryMaplayerActionsHandlerMixin
    {{/crossLink}}).

    @method _editLayer
    @param {Object} options Method options.
    @param {String} options.layerPath Path to editing layer.
    @param {String} options.layer Editing layer.
    @param {Object} options.layerProperties Object containing edited layer properties.
    @returns {Object} Edited layer.
    @private
  */
  _editLayer(options) {
    return this._super(...arguments);
  },

  /**
    Removes specified layer from layers hierarchy
    (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:/_removeLayer:method"}}
    FlexberryMaplayerActionsHandlerMixin
    {{/crossLink}}).

    @method _removeLayer
    @param {Object} options Method options.
    @param {String} options.layerPath Path to removing layer.
    @param {String} options.layer Removing layer itself.
    @returns {Object} Removed layer.
    @private
  */
  _removeLayer(options) {
    options = options || {};
    let layer = Ember.get(options, 'layer');
    
    if (!Ember.isNone(layer)) {
      layer.deleteRecord();
    }

    let layers = Ember.get(layer, 'layers');
    if (Ember.isArray(layers)) {
      layers.forEach((childLayer) => {
        this._removeLayer({
          layer: childLayer
        });
      });
    }

    return layer;
  }
});
