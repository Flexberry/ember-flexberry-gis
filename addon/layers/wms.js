/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';
import WfsFilterParserMixin from '../mixins/wfs-filter-parser';
import TileLayer from './tile';

/**
  Class describing WMS layer metadata.

  @class WmsLayer
  @extends TileLayer
*/
export default TileLayer.extend(WfsFilterParserMixin, {
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'legend', 'filter']
  */
  operations: ['edit', 'remove', 'identify', 'legend', 'filter'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    $.extend(true, settings, {
      info_format: undefined,
      feature_count: 100,
      url: undefined,
      version: undefined,
      layers: undefined,
      format: undefined,
      transparent: undefined,
      filter: '',
      legendSettings: {
        url: '',
        version: '',
        format: '',
        layers: '',
      },
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
    const settings = this._super(...arguments);

    settings.info_format = 'application/json';
    settings.feature_count = 100;
    settings.url = record.url.split('?')[0];
    settings.version = '1.3.0';
    settings.layers = record.id;
    settings.format = 'image/png';
    settings.transparent = true;

    return settings;
  },
});
