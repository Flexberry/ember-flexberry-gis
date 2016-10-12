/**
  @module ember-flexberry-gis
*/

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

    let leafletMap = this.get('leafletMap');
    leafletMap.panTo(options.latlng);

    let i18n = this.get('i18n');
    leafletMap.openPopup(
      `${i18n.t('map-commands.go-to.lat-caption')}: ${options.latlng.lat}; ` +
      `${i18n.t('map-commands.go-to.lng-caption')}: ${options.latlng.lng}`,
      options.latlng);
  }
});
