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
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify() {
    let allVisibleLayersToIdentify = Ember.A(this._super(...arguments) || []);

    let topVisibleLayerToIdenify = Ember.A();
    if (allVisibleLayersToIdentify.length > 0) {
      topVisibleLayerToIdenify.pushObject(allVisibleLayersToIdentify[0]);
    }

    return topVisibleLayerToIdenify;
  }
});
