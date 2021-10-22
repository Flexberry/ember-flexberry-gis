/**
  @module ember-flexberry-gis
*/

import { get } from '@ember/object';
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

    const point = get(options, 'point');
    const crs = get(options, 'crs');
    const xCaption = get(options, 'xCaption');
    const yCaption = get(options, 'yCaption');
    const isLatlng = get(options, 'isLatlng');

    const latlng = isLatlng ? new L.LatLng(point.x, point.y) : crs.unproject(point);
    const leafletMap = this.get('leafletMap');
    const popupContent = isLatlng
      ? `${xCaption}: ${latlng.lat}; `
      + `${yCaption}: ${latlng.lng}`
      : `${xCaption}: ${point.x}; `
      + `${yCaption}: ${point.y}`;

    leafletMap.openPopup(popupContent, latlng);
    leafletMap.panTo(latlng);
  },
});
