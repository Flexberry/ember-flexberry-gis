/**
  @module ember-flexberry-gis
*/

import BaseMapCommand from './base';

/**
  Export map-command.

  @class ExportMapCommand
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
