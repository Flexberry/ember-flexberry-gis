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
var locateMarker;
var locatePopup;

export default BaseMapCommand.extend({

  /**
    Executes map-command.

    @method execute
  */

  _execute(options) {
    this._super(...arguments);
    let leafletMap = this.get('leafletMap');

    leafletMap.on('locationfound', (e) => {
      if (locatePopup != null) {
        leafletMap.closePopup(locatePopup);
      }

      locateMarker = L.marker(e.latlng).addTo(leafletMap);

      //jscs:disable maximumLineLength
      locatePopup = locateMarker.bindPopup(this.get('i18n').t('components.map-commands.locate.lat') + e.latlng.lat.toFixed(0) + '<br>' + this.get('i18n').t('components.map-commands.locate.lng') + e.latlng.lng.toFixed(0)).openPopup();

      //jscs:enable maximumLineLength

    });

    leafletMap.on('locationerror', (e) => {

      //jscs:disable maximumLineLength
      L.popup().setLatLng(leafletMap.getCenter()).setContent(this.get('i18n').t('components.map-commands.locate.error') + '<br>' + e.message).openOn(leafletMap);

      //jscs:enable maximumLineLength

    });

    leafletMap.on('popupclose', (e) => {
      if (locateMarker != null) {
        leafletMap.removeLayer(locateMarker);
        locateMarker = null;
        locatePopup = null;
      }

    });
    leafletMap.locate({ setView: true, maxZoom: 16 });
  }
});
