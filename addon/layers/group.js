/**
  @module ember-flexberry-gis
*/

/**
  Class describing group layer metadata.

  @class GroupLayer
  @extends BaseLayer
*/
export default {
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'folder icon'
  */
  iconClass: 'folder icon',

  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['add', 'edit', 'remove']
  */
  operations: ['add', 'edit', 'remove']
};
