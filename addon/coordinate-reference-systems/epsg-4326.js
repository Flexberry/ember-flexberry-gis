/**
  @module ember-flexberry-gis
*/

/**
  EPSG:4326 CRS.

  @class Epsg4326Crs
*/
export default {
  /**
    CRS code.

    @property code
    @type String
    @default 'EPSG:4326'
  */
  code: 'EPSG:4326',

  /**
    CRS definition.

    @property definition
    @type String
    @default null
  */
  definition: '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',

  localeCaption: 'crs.epsg4326',

  /**
    Creates CRS instance CRS.

    @method getCRS
    @param {String} code CRS code.
    @param {String} definition CRS definition.
    @param {Object} options CRS options.
    @returns {<a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>} CRS instance.
  */
  create(code, definition, options) {
    return L.CRS.EPSG4326;
  }
};
