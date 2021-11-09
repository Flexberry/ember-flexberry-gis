/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import CombineLayer from './combine';

/**
  Class describing history layers metadata.

  @class WithHistoryLayer
  @extends CombineLayer
*/
export default CombineLayer.extend({

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      type: undefined,
      historyLayer: undefined,
    });
    return settings;
  }
});
