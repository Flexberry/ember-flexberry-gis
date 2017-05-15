/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin for identify-all map tools.

  @class IdentifyAllMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
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
          if (Ember.get(layer, 'canBeIdentified') && !excludedLayers.contains(layer)) {
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
