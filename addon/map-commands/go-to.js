/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapCommand from './base';

/**
  Go to map-command.
  Moves map to a given geographic point.

  @class GoToMapCommand
  @extends BaseMapCommand
*/
export default BaseMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    let point = Ember.get(options, 'point');
    let crs = Ember.get(options, 'crs');

    let latlng = null;
    if (crs === L.CRS.EPSG4326) {
      // X & Y already defined as latitude & longitude.
      latlng = new L.LatLng(point.x, point.y);
    } else {
      latlng = crs.unproject(point);
    }

    let leafletMap = this.get('leafletMap');
    leafletMap.panTo(latlng);

    let i18n = this.get('i18n');
    let popupContent = crs === L.CRS.EPSG4326 ?
      `${i18n.t('map-commands.go-to.lat-caption')}: ${latlng.lat}; ` +
      `${i18n.t('map-commands.go-to.lng-caption')}: ${latlng.lng}` :
      `${i18n.t('map-commands.go-to.x-caption')}: ${point.x}; ` +
      `${i18n.t('map-commands.go-to.y-caption')}: ${point.y}`;

    leafletMap.openPopup(popupContent, latlng);
  }
});
