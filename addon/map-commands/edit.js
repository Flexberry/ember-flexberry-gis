/**
  @module ember-flexberry-gis
*/

import BaseMapCommand from './base';

/**
  Edit map-command.

  @class EditMapCommand
  @extends BaseMapCommand
*/
export default BaseMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute() {
    this._super(...arguments);
  }
});
