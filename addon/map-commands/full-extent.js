/**
  @module ember-flexberry-gis
*/

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
  _execute() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    leafletMap.setZoom(leafletMap.getMinZoom());
  }
});
