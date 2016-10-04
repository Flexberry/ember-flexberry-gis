/**
  @module ember-flexberry-gis
*/

/**
  Class describing metadata for OpenStreetMap geocoder-layer
  that uses [Overpass API](Uses [Overpass API](http://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide) to perform straight & reverse geocoding).

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
    @default ['edit', 'remove', 'identify']
  */
  operations: ['edit', 'remove', 'identify'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    return {
      url: undefined
    };
  }
};
