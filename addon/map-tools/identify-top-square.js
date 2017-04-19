/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import IdentifyAllVisibleMapTool from './identify-all-square';

/**
  Identify map-tool that identifies only top visible map layer.

  @class IdentifyTopVisibleMapTool
  @extends IdentifyAllVisibleMapTool
*/
export default IdentifyAllVisibleMapTool.extend({
  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @param {Object} options Method options.
    @param {Object[]} options.excludedLayers Layers that must be excluded from identification.
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify({ excludedLayers }) {
    let allVisibleLayersToIdentify = Ember.A(this._super(...arguments) || []);

    let topVisibleLayerToIdenify = Ember.A();
    if (allVisibleLayersToIdentify.length > 0) {
      topVisibleLayerToIdenify.pushObject(allVisibleLayersToIdentify[0]);
    }

    return topVisibleLayerToIdenify;
  },

  /**
    Finishes identification.

    @method _finishIdentification
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} e.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {<a href="http://leafletjs.com/reference.html#rectangle">L.Rectangle</a>} options.boundingBoxLayer Rectangle layer related to bounding box.
    @param {Object[]} excludedLayers Objects describing those layers which were excluded from identification.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @return {<a href="http://leafletjs.com/reference.html#popup">L.Popup</a>} Popup containing identification results.
    @private
  */
  _finishIdentification(e) {
    let excludedLayers = Ember.get(e, 'excludedLayers');
    if (!Ember.isArray(excludedLayers)) {
      excludedLayers = Ember.A();
      Ember.set(e, 'excludedLayers', excludedLayers);
    }

    let result = Ember.get(e, 'results.0') || {};
    let layer = Ember.get(result, 'layer') || {};
    let features = Ember.get(result, 'features') || [];

    if (features.length === 0) {
      excludedLayers.pushObject(layer);
    }

    // If there is no identification results by current layer,
    // then try to identify next visible layer if possible.
    let includedLayers = this._getLayersToIdentify({ excludedLayers });
    if (features.length === 0 && includedLayers.length > 0) {
      this._startIdentification(e);
    } else {
      // Show results & stop identification.
      return this._super(...arguments);
    }
  }
});
