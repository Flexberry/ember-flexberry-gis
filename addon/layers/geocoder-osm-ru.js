/**
  @module ember-flexberry-gis
*/

/**
  Class describing metadata for OpenStreetMap.ru geocoder-layer
  that uses API of [OpenStreetMap.ru/api/search](https://github.com/ErshKUS/OpenStreetMap.ru/blob/master/api/search).

  @class GeocoderOsmRuLayer
*/
export default {
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
    return {
      url: undefined,
      autocompleteUrl: undefined
    };
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    return {
      queryString: '',
      searchType: 'all',
      maxResultsCount: 12,
      lat: null,
      lon: null
    };
  }
};
