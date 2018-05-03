/**
  @module ember-flexberry-gis
*/

/**
  Convert color HEX -> RGB

  @for Utils.Convertor
  @method hexToRgb
  @param String hex
  @return [] rgb
*/
let hexToRgb = function(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
};

/**
  Convert color RGB -> HEX

  @for Utils.Convertor
  @method hexToRgb
  @param [] rgb
  @return String hex
*/
let rgbToHex = function(rgb) {
  let result = '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
  return result;
};

export {
  hexToRgb,
  rgbToHex
};
