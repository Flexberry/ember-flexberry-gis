/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './-private/base';

/**
  Class describing metadata for OpenStreetMap.ru geocoder-layer
  that uses API of [OpenStreetMap.ru/api/search](https://github.com/ErshKUS/OpenStreetMap.ru/blob/master/api/search).

  @class GeocoderOsmRuLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'info circle icon'
  */
  iconClass: 'info circle icon',

  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'search']
  */
  operations: ['edit', 'remove', 'search'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      url: undefined,
      autocompleteUrl: undefined,
    });

    return settings;
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      queryString: '',
      searchType: 'all',
      maxResultsCount: 12,
      lat: null,
      lon: null
    });

    return settings;
  }
});
