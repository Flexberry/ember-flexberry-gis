/**
  @module ember-flexberry-gis
*/

import { run } from '@ember/runloop';

import { Promise } from 'rsvp';
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
  _execute(options) {
    this._super(...arguments);

    if (options.type === 'export') {
      return new Promise((resolve, reject) => {
        run(() => {
          this.get('leafletMap').downloadExport(options.data).then((value) => {
            resolve(value);
          }).catch((reason) => {
            reject(reason);
          });
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        run(() => {
          this.get('leafletMap').printExport(options.data).then((value) => {
            resolve(value);
          }).catch((reason) => {
            reject(reason);
          });
        });
      });
    }
  }
});
