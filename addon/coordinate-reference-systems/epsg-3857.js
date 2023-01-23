/**
  @module ember-flexberry-gis
*/

/**
  EPSG:3857 CRS.

  @class Epsg3857Crs
*/
export default {
  /**
    CRS code.

    @property code
    @type String
    @default 'EPSG:3857'
  */
  code: 'EPSG:3857',

  /**
    CRS definition.

    @property definition
    @type String
    @default null
  */
  definition: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',

  localeCaption: 'crs.epsg3857',

  /**
    Creates CRS instance CRS.

    @method getCRS
    @param {String} code CRS code.
    @param {String} definition CRS definition.
    @param {Object} options CRS options.
    @returns {<a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>} CRS instance.
  */
  create(code, definition, options) {
    return L.CRS.EPSG3857;
  }
};
