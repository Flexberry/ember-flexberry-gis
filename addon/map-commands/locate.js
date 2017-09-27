/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapCommand from './base';

/**
  Full extent map-command.
  Changes map view to it's full extent.

  @class LocateMapCommand
  @extends BaseMapCommand
*/

export default BaseMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);
    let leafletMap = this.get('leafletMap');
	leafletMap.locate({setView: true, maxZoom: 16});
  }
});