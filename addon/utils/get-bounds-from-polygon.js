/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';

import { get } from '@ember/object';

/**
  Used for getting bounds from boundingBox polygon.

  @for Utils.Layers
  @method getBounds
  @param {Object} polygon
  @return {Object} Retriveved bounds from polygon
*/
const getBounds = function (polygon) {
  let minLat;
  let minLng;
  let maxLat;
  let maxLng;
  const boundingBox = polygon || {};
  const boundingBoxCoords = get(boundingBox, 'coordinates.0') || [];
  boundingBoxCoords.forEach((coordinate) => {
    if (coordinate[0] > maxLng || isNone(maxLng)) {
      maxLng = coordinate[0];
    }

    if (coordinate[0] < minLng || isNone(minLng)) {
      minLng = coordinate[0];
    }

    if (coordinate[1] > maxLat || isNone(maxLat)) {
      maxLat = coordinate[1];
    }

    if (coordinate[1] < minLat || isNone(minLat)) {
      minLat = coordinate[1];
    }
  });

  return {
    minLat: minLat || -90, minLng: minLng || -180, maxLat: maxLat || 90, maxLng: maxLng || 180,
  };
};

export {
  getBounds
};
