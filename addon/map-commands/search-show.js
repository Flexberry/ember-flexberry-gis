/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import SearchMapCommand from './search';

/**
  Search show map-command.
  Shows results of previously executed search on map.

  @class SearchShowMapCommand
  @extends SearchMapCommand
*/
export default SearchMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    options = options || {};
    let features = Ember.get(options, 'features');

    // Clear previous features.
    let featuresLayer = this.get('featuresLayer');
    featuresLayer.clearLayers();

    // Show new features.
    let featuresGeoJsonLayer = L.geoJSON(features, {
      style: function (feature) {
        return { color: 'yellow' };
      }
    }).bindPopup(function (layer) {
      // TODO: Use layer-related search settings to retrieve property to display.
      return '' + layer.feature.properties[Object.keys(layer.feature.properties)[0]];
    }).addTo(featuresLayer);

    let leafletMap = this.get('leafletMap');
    leafletMap.fitBounds(featuresGeoJsonLayer.getBounds());
  }
});
