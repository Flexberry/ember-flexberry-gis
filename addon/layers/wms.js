/**
  @module ember-flexberry-gis
*/

/**
  Class describing WMS layer metadata.

  @class WmsLayer
*/
export default {
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'image icon'
  */
  iconClass: 'image icon',

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
    return {
      info_format: undefined,
      url: undefined,
      version: undefined,
      layers: undefined,
      format: undefined,
      transparent: undefined
    };
  }
};
