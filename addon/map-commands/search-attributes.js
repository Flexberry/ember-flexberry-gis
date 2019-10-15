/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import SearchMapCommand from './search';

/**
  Search attributes map-command.
  Performs search by attributes within available map layers.

  @class SearchAttributesMapCommand
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
    return new Ember.RSVP.Promise(resolve => {
      // Layer that must be searched.
      let layer = Ember.get(options, 'layer');
      Ember.assert(
        `Wrong type of \`options.layer\` property: ` +
        `actual type is \`${Ember.typeOf(layer)}\`, but \`object\` or \`instance\` is expected.`,
        !Ember.isNone(layer));

      // Search options related to layer type.
      let searchOptions = Ember.get(options, 'searchOptions');
      Ember.assert(
        `Wrong type of \`options.searchOptions\` property: ` +
        `actual type is \`${Ember.typeOf(searchOptions)}\`, but \`object\` or \`instance\` is expected.`,
        !Ember.isNone(searchOptions));

      let leafletMap = this.get('leafletMap');
      let e = {
        latlng: leafletMap.getCenter(),
        searchOptions: searchOptions,
        context: false,
        filter(layerModel) {
          return layerModel === layer;
        },
        results: Ember.A()
      };

      // Fire custom event on leaflet map.
      // Layer component must handle this event & store search result in e.features.
      leafletMap.fire('flexberry-map:search', e);

      // Return received features or features promise.
      resolve(e.results);
    });

  }
});
