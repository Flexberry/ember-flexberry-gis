/**
  @module ember-flexberry-gis
*/

/**
  Creates copy of the specified map layer.

  @for Utils.LayerCopy
  @method copyLayer
  @param {NewPlatformFlexberryGISMapLayer} layerModel
  @param {DS.Store} store Ember data store.
  @return {NewPlatformFlexberryGISMapLayer} Layer model copy.
*/

let hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
};

let rgbToHex = function(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
};

export {
  hexToRgb,
  rgbToHex
};
