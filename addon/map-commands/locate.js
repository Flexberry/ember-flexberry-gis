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
    Location marker.

    @property locateMarker
    @type <a href=” http://leafletjs.com/reference-1.2.0.html#marker”>L.Marker</a>
    @default null
  */
  locateMarker: null,

  /**
    Location popup.

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

    // Clean up results of previous execution.
    this.cleanUpLocationResults();

    // Attach location events handlers & and execute geolocation.
    let leafletMap = this.get('leafletMap');
    leafletMap.on('locationfound', this.onLocationFound, this);
    leafletMap.on('locationerror', this.onLocationError, this);

    leafletMap.locate({ setView: true, maxZoom: 16 });
  },

  /**
    Handles leaflet map's 'locationfound' event.

    @method onLocationFound
    @param {Object} e Event object.
    @param {Object} e.latlng Founded location.
  */
  onLocationFound(e) {
    // Show marker in founded location.
    let leafletMap = this.get('leafletMap');
    let locateMarker = L.marker(e.latlng).addTo(leafletMap);
    this.set('locateMarker', locateMarker);

    // Create popup with founded location coordinates.
    let locatePopup = L.popup().setContent(
      this.get('i18n').t('components.map-commands.locate.lat') + e.latlng.lat.toFixed(5) + '<br>' +
      this.get('i18n').t('components.map-commands.locate.lng') + e.latlng.lng.toFixed(5));
    this.set('locatePopup', locatePopup);

    // Bind popup to marker.
    locateMarker
      .bindPopup(locatePopup)
      .openPopup();

    // Clean up location results when popup will be closed.
    leafletMap.on('popupclose', this.cleanUpLocationResults, this);

    // Unsubscribe from location events handling to avoid same handlers to be attached several times when '_execute' method will be called again.
    leafletMap.off('locationfound', this.onLocationFound, this);
    leafletMap.off('locationerror', this.onLocationError, this);
  },

  /**
    Handles leaflet map's 'locationerror' event.

    @method onLocationError
    @param {Object} e Event object.
    @param {Object} e.message Error message.
  */
  onLocationError(e) {
    let leafletMap = this.get('leafletMap');

    // Create popup with error message.
    let locatePopup = L.popup().setLatLng(leafletMap.getCenter())
      .setContent(this.get('i18n').t('components.map-commands.locate.error') + '<br>' + e.message)
      .openOn(leafletMap);
    this.set('locatePopup', locatePopup);

    // Clean up location results when popup will be closed.
    leafletMap.on('popupclose', this.cleanUpLocationResults, this);

    // Unsubscribe from location events handling to avoid same handlers to be attached several times when '_execute' method will be called again.
    leafletMap.off('locationfound', this.onLocationFound, this);
    leafletMap.off('locationerror', this.onLocationError, this);
  },

  /**
    Clean ups location results & handles leaflet map's 'popupclose' event.

    @method onLocationFound
    @param {Object} [e] Event object.
    @param {Object} [e.popup] Reference to closed popup.
  */
  cleanUpLocationResults(e) {
    let leafletMap = this.get('leafletMap');
    let locateMarker = this.get('locateMarker');
    let locatePopup = this.get('locatePopup');

    // Clean up only if closed popup is locate popup, otherwise break because some other popup has been closed.
    if (!(Ember.isNone(e) || e.popup === locatePopup)) {
      return;
    }

    if (!Ember.isNone(locateMarker)) {
      locateMarker.unbindPopup();
      locateMarker.remove();
      this.set('locateMarker', null);
    }

    if (!Ember.isNone(locatePopup)) {
      leafletMap.off('popupclose', this.onLocationPopupClose, this);
      locatePopup.remove();
      this.set('locatePopup', null);
    }
  },

  /**
    Destroys locate map-command.
  */
  willDestroy() {
    this._super(...arguments);

    this.cleanUpLocationResults();
  }
});
