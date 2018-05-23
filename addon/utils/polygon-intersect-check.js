/**
  @module ember-flexberry-gis
*/
import kinks from 'npm:@turf/kinks';

_polygonTypeName: 'Polygon';

_multiPolygonTypeName: 'MultiPolygon';

/**
  Creates copy of the specified map layer.

  @for Utils.CheckIntersect
  @method checkIntersect
  @param {Polygon} polygon
  @return Boolean isIntersect
*/
let checkIntersect = function(polygon) {
  let workingPolygon;

  if(checkForGeoJSON(polygon)) {
    workingPolygon = polygon;
  } else {
    workingPolygon = polygonConvert(polygon);
  }

  let intersectPoints = Ember.A();
  let isIntersect = false;
  if (!Ember.isNone(workingPolygon)) {
    intersectPoints = kinks(workingPolygon)
    isIntersect = (intersectPoints.features.length != 0) ? true : false;
  } else {
    isIntersect = false;
  }

  return isIntersect;
};

let checkForGeoJSON = function(polygon) {
  let checkResult = false;
  if( (polygon.type === 'MultiPolygon' || polygon.type === 'Polygon') ) {
    checkResult = true;
  }

  return checkResult;
};

let polygonConvert = function(polygon) {
  let convertedPolygon;

  if (polygon instanceof L.Polygon) {
    convertedPolygon = polygon.toGeoJSON();
  }

  if (polygon instanceof Array) {
    let coordinatesArray = polygon;
    convertedPolygon = arrayToGeoJSON(coordinatesArray);
  }

  return convertedPolygon;

};

let arrayToGeoJSON = function(array) {
  let geoJsonPolygon = {
    type: 'undefined',
    coordinates: null
  };

  let type = chooseObjectType(polygon);
  if(type === 'undefined') {
    return null;
  }
  geoJsonPolygon.type = type;
  geoJsonPolygon.coordinates = polygon;

  return geoJsonPolygon;
};

let chooseTypeForCoordinates = function(array) {
  let arrayDepth = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] instanceof Array ) {
      arrayDepth = 1;
      for (let j = 0; j < array[i].length; j++) {
        if (array[i][j] instanceof Array ) {
          arrayDepth = 2;
        }
      }
    }
  }

  switch(arrayDepth) {
    case 0:
      return 'undefined';
      break;
    case 1:
      return _polygonTypeName;
      break;
    case 1:
      return _multiPolygonTypeName;
      break;
  }
}

export {
  checkIntersect
};
