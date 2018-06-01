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
export default function checkIntersect(polygon) {
  let workingPolygon;

  if (polygon.type === 'MultiPolygon' || polygon.type === 'Polygon') {
    workingPolygon = polygon;
  } else {
    workingPolygon = polygonConvert(polygon);
  }

  let isIntersect = false;
  if (!Ember.isNone(workingPolygon)) {
    let intersectPoints = kinks(workingPolygon);
    isIntersect = intersectPoints.features.length > 0;
  }

  return isIntersect;
}

/**
  Convert polygon to GeoJson

  @method polygonConvert
  @param {Polygon} polygon
  @return {GeoJson} convertedPolygon
*/
function polygonConvert(polygon) {
  let convertedPolygon;
  let currentPolygon = polygon;
  if (currentPolygon instanceof Array) {
    currentPolygon = L.polygon(currentPolygon);
  }

  if (currentPolygon instanceof L.Polygon) {
    convertedPolygon = currentPolygon.toGeoJSON();
  }

  return convertedPolygon;
}
