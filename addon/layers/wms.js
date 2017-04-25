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
    @default ['edit', 'remove', 'identify', 'legend']
  */
  operations: ['edit', 'remove', 'identify', 'legend'],

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
      transparent: undefined,
      legendSettings: {
        url: '',
        version: '',
        format: '',
        layers: ''
      }
    });

    return settings;
  },

  /**
    Creates new settings object (with settings related to layer-type) from the specified CSW record.

    @method createSetingsFromCsw
    @param {Object} Specified CSW record.
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSetingsFromCsw(record) {
    let settings = this._super(...arguments);

    settings.info_format = 'application/json';
    settings.url = record.url.split('?')[0];
    settings.version = '1.3.0';
    settings.layers = record.id;
    settings.format = 'image/png';
    settings.transparent = true;

    return settings;
  }
});
