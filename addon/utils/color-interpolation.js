/**
  @module ember-flexberry-gis
*/

import { hexToRgb, rgbToHex } from 'ember-flexberry-gis/utils/color-convertor';


/**
  Get color range between start and end colors

  @for Utils.Interpolator
  @method getGradientColors
  @param String colorStart in HEX
  @param String colorEnd in HEX
  @param int steps
  @return [] hexArray
*/
const getGradientColors = function (colorStart, colorEnd, steps) {
  const interpolatedColorArray = [];

  if (steps <= 1) {
    interpolatedColorArray.push(colorStart);
    return interpolatedColorArray;
  }

  const rgbColorStart = hexToRgb(colorStart);
  const rgbColorEnd = hexToRgb(colorEnd);
  const stepFactor = 1 / (steps - 1);

  for (let i = 0; i < steps; i++) {
    interpolatedColorArray.push(
      rgbToHex(interpolateColor(rgbColorStart, rgbColorEnd, stepFactor * i))
    );
  }

  return interpolatedColorArray;
};

/**
  Return interpolated colors.

  @method interpolateColor
  @param String color1 in HEX
  @param String color2 in HEX
  @param int factor
  @return [] rgbArray
  @private
*/
let interpolateColor = function (color1, color2, factor) {
  if (arguments.length < 3) {
    factor = 0.5;
  }

  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }

  return result;
};

export {
  getGradientColors
};
