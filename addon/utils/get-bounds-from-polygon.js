/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Used for getting bounds from boundingBox polygon.

  @for Utils.Layers
  @method getBounds
  @param {Object} polygon
  @return {Object} Retriveved bounds from polygon
*/
let getBounds = function (polygon) {
  let minLat;
  let minLng;
  let maxLat;
  let maxLng;
  let boundingBox = polygon || {};
  let boundingBoxCoords = Ember.get(boundingBox, 'coordinates.0') || [];
  boundingBoxCoords.forEach(coordinate => {
    if (coordinate[0] > maxLng || Ember.isNone(maxLng)) {
      maxLng = coordinate[0];
    }

    if (coordinate[0] < minLng || Ember.isNone(minLng)) {
      minLng = coordinate[0];
    }

    if (coordinate[1] > maxLat || Ember.isNone(maxLat)) {
      maxLat = coordinate[1];
    }

    if (coordinate[1] < minLat || Ember.isNone(minLat)) {
      minLat = coordinate[1];
    }
  });

  return { minLat: minLat || -90, minLng: minLng || -180, maxLat: maxLat || 90, maxLng: maxLng || 180 };
};

export {
  getBounds
};
