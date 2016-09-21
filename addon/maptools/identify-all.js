/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import IdentifyMaptool from './identify';

/**
  Identify map tool that identifies all map layers.

  @class IdentifyAllMaptool
  @extends IdentifyMaptool
*/
export default IdentifyMaptool.extend({
  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @param {Object} options Method options.
    @param {Object[]} options.excludedLayers Layers that must be excluded from identification.
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify({ excludedLayers }) {
    excludedLayers = Ember.A(excludedLayers || []);

    let getLayersToIdentify = (layers) => {
      let result = Ember.A();

      if (Ember.isArray(layers)) {
        layers.forEach((layer) => {
          if (this._layerCanBeIdentified(layer) && !excludedLayers.contains(layer)) {
            result.pushObject(layer);
          }
          
          let childLayers = Ember.get(layer, 'layers');
          result.pushObjects(getLayersToIdentify(childLayers));
        });
      }

      return result;
    };

    let rootLayers = this.get('layers');
    return getLayersToIdentify(rootLayers);
  }
});
