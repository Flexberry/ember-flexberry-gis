/**
  @module ember-flexberry-gis
*/

import { hexToRgb } from 'ember-flexberry-gis/utils/color-convertor';
import { rgbToHex } from 'ember-flexberry-gis/utils/color-convertor';

/**
  Get color range between start and end colors

  @for Utils.Interpolator
  @method getGradientColors
  @param String colorStart
  @param String colorEnd
  @param int steps
  @return [] hexArray
*/
let getGradientColors = function(colorStart, colorEnd, steps) {
  let interpolatedColorArray = [];

  if (steps <= 1) {
    interpolatedColorArray.push(colorStart);
    return interpolatedColorArray;
  }

  let rgbColorStart = hexToRgb(colorStart);
  let rgbColorEnd = hexToRgb(colorEnd);
  let stepFactor = 1 / (steps - 1);

  for (var i = 0; i < steps; i++) {
    interpolatedColorArray.push(
      rgbToHex(interpolateColor(rgbColorStart, rgbColorEnd, stepFactor * i))
    );
  }

  return interpolatedColorArray;
};

let interpolateColor = function(color1, color2, factor) {
  if (arguments.length < 3) {
    factor = 0.5;
  }

  var result = color1.slice();
  for (var i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }

  return result;
};

export {
  getGradientColors
};
