/**
  @module ember-flexberry-gis
*/

import BaseLayer from './-private/base';

/**
  Class describing group layer metadata.

  @class GroupLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
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
  operations: ['add', 'edit', 'remove'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    return this._super(...arguments);
  }
});
