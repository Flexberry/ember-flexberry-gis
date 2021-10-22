/**
  @module ember-flexberry-gis
*/

import { run } from '@ember/runloop';

import { Promise } from 'rsvp';
import ExportMapCommand from './export';

/**
  Export & download map-command.
  Exports map into image & downloads it as attachment.

  @class ExportDownloadMapCommand
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
    return new Promise((resolve, reject) => {
      run(() => {
        this.get('leafletMap').downloadExport(options).then((value) => {
          resolve(value);
        }).catch((reason) => {
          reject(reason);
        });
      });
    });
  },
});
