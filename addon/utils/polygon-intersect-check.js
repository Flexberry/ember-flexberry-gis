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
  if(checkGeoJSON(polygon)) {
    workingPolygon = polygon;
  } else {
    workingPolygon = polygonConvertor(polygon);
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

let checkGeoJSON = function(polygon) {
  let checkResult = false;
  if( (polygon.type === 'MultiPolygon' || polygon.type === 'Polygon') ) {
    console.log('ISGEOJSON  '+polygon.type);
    checkResult = true;
  }

  return checkResult;
}

let polygonConvertor = function(polygon) {
  let geoJsonPolygon = {
    type: 'undefined',
    coordinates: null
  };

  if (polygon instanceof L.Polygon) {
    console.log('ISPOLYGON')
    let latLng = polygon.getLatLngs()[0];
    let type = chooseTypeForCoordinates(latLng);
    geoJsonPolygon.type = type;
    geoJsonPolygon.coordinates = latLng;
  } else if(polygon instanceof Array) {
    let type = chooseObjectType(polygon);
    geoJsonPolygon.type = type;
    geoJsonPolygon.coordinates = polygon;
  }

  return (geoJsonPolygon.type != 'undefined') ? geoJsonPolygon : null;
}

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
