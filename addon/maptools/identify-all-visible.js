/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import IdentifyMaptool from './identify';

/**
  Identify map tool that identifies all visible map layers.

  @class IdentifyAllVisibleMaptool
  @extends IdentifyMaptool
*/
export default IdentifyMaptool.extend({
  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify() {
    let getVisibleLayersToIdentify = (layers) => {
      let result = Ember.A();

      if (Ember.isArray(layers)) {
        layers.forEach((layer) => {
          let layerIsVisible = Ember.get(layer, 'visibility') === true;
          if (this._layerCanBeIdentified(layer) && layerIsVisible) {
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
