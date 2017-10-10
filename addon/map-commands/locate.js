/**
  @module ember-flexberry-gis
*/

import BaseMapCommand from './base';

/**
  Locate map-command.
  Changes msp's view to user's current location.

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
    leafletMap.once('locationfound',(e)=>{
        L.marker(e.latlng).addTo(leafletMap).bindPopup('My coordinates: '+ '<br>'+ e.latlng.lat.toFixed(0) +'<br>'+ e.latlng.lng.toFixed(0) ).openPopup();
    });
    leafletMap.once('locationerror',(e)=>{
        alert(e.message);
    });
    leafletMap.locate({ setView: true, maxZoom: 16 });
  }
});
