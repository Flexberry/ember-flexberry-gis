/**
  @module ember-flexberry-gis
*/

import { get } from '@ember/object';

import { A, isArray } from '@ember/array';
import Mixin from '@ember/object/mixin';

/**
  Mixin for identify-all map tools.

  @class IdentifyAllMixin
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
  _getLayersToIdentify({ excludedLayers }) {
    excludedLayers = A(excludedLayers || []);

    let getLayersToIdentify = (layers) => {
      let result = A();

      if (isArray(layers)) {
        layers.forEach((layer) => {
          if (get(layer, 'canBeIdentified') && !excludedLayers.contains(layer)) {
            result.pushObject(layer);
          }

          let childLayers = get(layer, 'layers');
          result.pushObjects(getLayersToIdentify(childLayers));
        });
      }

      return result;
    };

    let rootLayers = this.get('layers');
    return getLayersToIdentify(rootLayers);
  }
});
