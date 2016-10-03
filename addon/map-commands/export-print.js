/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import ExportMapCommand from './export';

/**
  Export & print map-command.
  Exports map into image & downloads it as attachment.

  @class ExportPrintMapCommand
  @extends ExportMapCommand
*/
export default ExportMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    // Return RSVP.Promise to make base map-command wait.
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.run(() => {
        this.get('leafletMap').printExport(options).then((value) => {
          resolve(value);
        }).catch((reason) => {
          reject(reason);
        });
      });
    });
  }
});
