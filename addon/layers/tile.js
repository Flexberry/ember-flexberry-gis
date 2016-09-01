/**
  @module ember-flexberry-gis
*/

/**
  Class describing tile layer metadata.

  @class TileLayer
  @extends BaseLayer
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
    @default ['edit', 'remove']
  */
  operations: ['edit', 'remove']
};
