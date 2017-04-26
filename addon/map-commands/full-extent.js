/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapCommand from './base';

/**
  Full extent map-command.
  Changes map view to it's full extent.

  @class FullExtentMapCommand
  @extends BaseMapCommand
*/
export default BaseMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);
    let latLng = Ember.get(options, 'latLng');
    let zoom = Ember.get(options, 'zoom');

    let leafletMap = this.get('leafletMap');
    leafletMap.setView(latLng, zoom);
  }
});
