/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapCommand from './base';

/**
  Locate map-command.
  Changes msp's view to user's current location.

  @class LocateMapCommand
  @extends BaseMapCommand
*/

export default BaseMapCommand.extend({
  /**
    Location marker variable

    @property locateMarker
    @type <a href=” http://leafletjs.com/reference-1.2.0.html#marker”>L.Marker</a>
    @default null
  */
  locateMarker: null,

  /**
    Location marker popup variable

    @property locatePopup
    @type <a href=” http://leafletjs.com/reference-1.2.0.html#popup”>L.Popup</a>
    @default null
  */
  locatePopup: null,

  /**
    Executes map-command.

    @method execute
  */

  _execute(options) {
    this._super(...arguments);
    let leafletMap = this.get('leafletMap');
    let locateMarker = this.get('locateMarker');
    if (Ember.isNone(locateMarker)) {
      locateMarker = null;
      this.set('locateMarker', locateMarker);
    }

    let locatePopup = this.get('locatePopup');
    if (Ember.isNone(locateMarker)) {
      locatePopup = null;
      this.set('locatePopup', locatePopup);
    }

    leafletMap.once('locationfound', (e) => {
      if (locatePopup != null) {
        leafletMap.closePopup(locatePopup);
      }

      locateMarker = L.marker(e.latlng).addTo(leafletMap);

      locatePopup = locateMarker.bindPopup(
        this.get('i18n').t('components.map-commands.locate.lat') + e.latlng.lat.toFixed(0) +
         '<br>' + this.get('i18n').t('components.map-commands.locate.lng') + e.latlng.lng.toFixed(0)).openPopup();

      locatePopup.once('popupclose', onPopupClose);
    });

    leafletMap.once('locationerror', (e) => {
      L.popup().setLatLng(
        leafletMap.getCenter()).setContent(this.get('i18n').t('components.map-commands.locate.error') +
        '<br>' + e.message).openOn(leafletMap);
    });

    function onPopupClose() {
      leafletMap.removeLayer(locateMarker);
      locateMarker = null;
      locatePopup = null;
    }

    leafletMap.locate({ setView: true, maxZoom: 16 });
  }
});
