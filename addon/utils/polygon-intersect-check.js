/**
  @module ember-flexberry-gis
*/
import kinks from 'npm:@turf/kinks';
import Ember from 'ember';

/**
  Check polygons on intersection.

  @for Utils.CheckIntersect
  @method checkIntersect
  @param {Polygon} polygon L.Polygon, latLngs array or GeoJson Polygon/Multipolygon
  @return Boolean isIntersect
*/
let checkIntersect = function(polygon) {
  let workingPolygon;

  if (checkOnGeoJsonPolygon(polygon)) {
    workingPolygon = polygon;
  } else {
    workingPolygon = polygonConvert(polygon);
  }

  let intersectPoints = Ember.A();
  let isIntersect = false;
  if (!Ember.isNone(workingPolygon)) {
    intersectPoints = kinks(workingPolygon);
    isIntersect = (intersectPoints.features.length !== 0) ? true : false;
  } else {
    isIntersect = false;
  }

  return isIntersect;
};

/**
  Check polygon on GeoJson type.

  @method checkOnGeoJsonPolygon
  @param {Polygon} polygon
  @return Boolean checkResult
*/
let checkOnGeoJsonPolygon = function(polygon) {
  let checkResult = false;
  if ((polygon.type === 'MultiPolygon' || polygon.type === 'Polygon')) {
    checkResult = true;
  }

  return checkResult;
};

/**
  Convert polygon to GeoJson

  @method polygonConvert
  @param {Polygon} polygon
  @return {GeoJson} convertedPolygon
*/
let polygonConvert = function(polygon) {
  let convertedPolygon;
  let currentPolygon = polygon;
  if (currentPolygon instanceof Array) {
    currentPolygon = arrayToPolygon(currentPolygon);
  }

  if (currentPolygon instanceof L.Polygon) {
    convertedPolygon = currentPolygon.toGeoJSON();
  }

  return convertedPolygon;

};

/**
  Convert latlngs array to L.polygon

  @method arrayToPolygon
  @param [] array
  @return L.polygon convertedPolygon
*/
let arrayToPolygon = function(array) {
  let latlngs = array;
  let polygon = L.polygon(latlngs);

  return polygon;
};

export {
  checkIntersect
};
