/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
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
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run(() => {
          this.get('leafletMap').downloadExport(options.data).then((value) => {
            resolve(value);
          }).catch((reason) => {
            reject(reason);
          });
        });
      });
    } else {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run(() => {
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
