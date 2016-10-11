/**
  @module ember-flexberry-gis
*/

import SearchMapCommand from './search';

/**
  Search clear map-command.
  Clears results of executed search by attributes within available map layers.

  @class SearchClearMapCommand
  @extends SearchMapCommand
*/
export default SearchMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    let featuresLayer = this.get('featuresLayer');
    featuresLayer.clearLayers();
  }
});
