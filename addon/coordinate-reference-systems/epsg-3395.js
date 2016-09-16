/**
  @module ember-flexberry-gis
*/

/**
  EPSG:3395 CRS.

  @class Epsg3395Crs
*/
export default {
  /**
    CRS code.

    @property code
    @type String
    @default 'EPSG:3395'
  */
  code: 'EPSG:3395',

  /**
    CRS definition.

    @property definition
    @type String
    @default null
  */
  definition: null,

  /**
    Creates CRS instance CRS.

    @method getCRS
    @param {String} code CRS code.
    @param {String} definition CRS definition.
    @param {Object} options CRS options.
    @returns {<a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>} CRS instance.
  */
  create(code, definition, options) {
    return L.CRS.EPSG3395;
  }
};
