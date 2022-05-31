/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';
import BaseLayer from './-private/base';

/**
  Class describing tile layer metadata.

  @class TileLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'image icon'
  */
  iconClass: 'image icon',

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.operations = this.operations || ['edit', 'remove'];
  },

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    $.extend(true, settings, {
      url: undefined,
      noWrap: true,
      minZoom: 0,
      maxZoom: 25,
    });

    return settings;
  },
});
