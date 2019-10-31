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

    @method _execute
    @param {Object} options Method options.
    @param {Object} options.latLng Center of new map view.
    @param {Object} options.zoom Zoom of new map view.
    @private
  */
  _execute(options) {
    this._super(...arguments);

    let latLng = Ember.get(options, 'latLng');
    let zoom = Ember.get(options, 'zoom');

    let leafletMap = this.get('leafletMap');
    leafletMap.setView(latLng, zoom);
  }
});
