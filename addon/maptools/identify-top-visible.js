/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import IdentifyAllVisibleMaptool from './identify-all-visible';

/**
  Identify map tool that identifies only top visible map layer.

  @class IdentifyTopVisibleMaptool
  @extends IdentifyAllVisibleMaptool
*/
export default IdentifyAllVisibleMaptool.extend({
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
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
    representing bounding box within which layer's objects is identified.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @private
  */

  _finishIdentification(e) {
    let boundingBox = Ember.get(e, 'boundingBox');
    let latlng = Ember.get(e, 'latlng');
    let excludedLayers = Ember.A(Ember.get(e, 'excludedLayers') || []);
    let result = Ember.get(e, 'results.0') || {};
    let layer = Ember.get(result, 'layer') || {};
    let features = Ember.get(result, 'features') || [];

    if (features.length === 0) {
      excludedLayers.pushObject(layer);
    }

    // iIf there is no identification results by current layer.
    // Try to identify next visible layer if possible (_finishIdentification will be called again).
    let includedLayers = this._getLayersToIdentify({ excludedLayers });
    if (features.length === 0 && includedLayers.length > 0) {
      this._startIdentification({
        boundingBox: boundingBox,
        latlng: latlng,
        excludedLayers: excludedLayers
      });
    } else {
      // Show results & stop identification.
      this._super(...arguments);
      return;
    }
  }
});
