/**
  @module ember-flexberry-gis
*/

import { get, set } from '@ember/object';

import { A, isArray } from '@ember/array';
import Mixin from '@ember/object/mixin';

/**
  Mixin for identify-top map tools.

  @class IdentifyTopMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @param {Object} options Method options.
    @param {Object[]} options.excludedLayers Layers that must be excluded from identification.
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify() {
    const allVisibleLayersToIdentify = A(this._super(...arguments) || []);

    const topVisibleLayerToIdenify = A();
    if (allVisibleLayersToIdentify.length > 0) {
      topVisibleLayerToIdenify.pushObject(allVisibleLayersToIdentify[0]);
    }

    return topVisibleLayerToIdenify;
  },

  /**
    Finishes identification.

    @method _finishIdentification
    @param {Object} e Event object.
    @param {Array} options.polygonVertices Polygon vertices of type <a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.relatedLayer Polygon layer related to given vertices.
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
    let excludedLayers = get(e, 'excludedLayers');
    if (!isArray(excludedLayers)) {
      excludedLayers = A();
      set(e, 'excludedLayers', excludedLayers);
    }

    const result = get(e, 'results.0') || {};
    const layer = get(result, 'layerModel') || {};
    const features = get(result, 'features') || [];
    const _this = this;
    const superFunction = this._super;
    const handleResult = function (condition) {
      if (condition) {
        excludedLayers.pushObject(layer);
      }

      // If there is no identification results by current layer,
      // then try to identify next visible layer if possible.
      const includedLayers = this._getLayersToIdentify({ excludedLayers, });
      if (condition && includedLayers.length > 0) {
        this._startIdentification(e);
      } else {
        // Show results & stop identification.
        return superFunction.call(this, e);
      }
    };

    features.then((identifyResult) => {
      const condition = identifyResult.length === 0;
      handleResult.call(_this, condition);
    }).catch(() => {
      handleResult.call(_this, true);
    });
  },
});
