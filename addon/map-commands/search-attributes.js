/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';

import { typeOf, isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import { Promise } from 'rsvp';
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
    return new Promise(resolve => {
      // Layer that must be searched.
      let layer = get(options, 'layer');
      assert(
        `Wrong type of \`options.layer\` property: ` +
        `actual type is \`${typeOf(layer)}\`, but \`object\` or \`instance\` is expected.`,
        !isNone(layer));

      // Search options related to layer type.
      let searchOptions = get(options, 'searchOptions');
      assert(
        `Wrong type of \`options.searchOptions\` property: ` +
        `actual type is \`${typeOf(searchOptions)}\`, but \`object\` or \`instance\` is expected.`,
        !isNone(searchOptions));

      let leafletMap = this.get('leafletMap');
      let e = {
        latlng: leafletMap.getCenter(),
        searchOptions: searchOptions,
        context: false,
        filter(layerModel) {
          return layerModel === layer;
        },
        results: A()
      };

      // Fire custom event on leaflet map.
      // Layer component must handle this event & store search result in e.features.
      leafletMap.fire('flexberry-map:search', e);

      // Return received features or features promise.
      resolve(e.results);
    });

  }
});
