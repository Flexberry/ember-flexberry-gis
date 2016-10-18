/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import TileLayer from './tile';

/**
  Class describing WMS layer metadata.

  @class WmsLayer
  @extends TileLayer
*/
export default TileLayer.extend({
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify']
  */
  operations: ['edit', 'remove', 'identify'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      info_format: undefined,
      url: undefined,
      version: undefined,
      layers: undefined,
      format: undefined,
      transparent: undefined
    });

    return settings;
  }
});
