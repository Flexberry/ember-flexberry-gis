/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin for identify-visible map tools.

  @class IdentifyVisibleMixin
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

    let getVisibleLayersToIdentify = (layers) => {
      let result = Ember.A();

      if (Ember.isArray(layers)) {
        layers.forEach((layer) => {
          let layerIsVisible = Ember.get(layer, 'visibility') === true;
          if (Ember.get(layer, 'canBeIdentified') && layerIsVisible && !excludedLayers.contains(layer)) {
            result.pushObject(layer);
          }

          // If parent layer is invisible then all child layers are invisible too,
          // so there is no need to check them.
          if (!layerIsVisible) {
            return result;
          }

          let childLayers = Ember.get(layer, 'layers');
          result.pushObjects(getVisibleLayersToIdentify(childLayers));
        });
      }

      return result;
    };

    let rootLayers = this.get('layers');
    return getVisibleLayersToIdentify(rootLayers);
  }
});
