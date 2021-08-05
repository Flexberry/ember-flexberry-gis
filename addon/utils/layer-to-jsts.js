import jsts from 'npm:jsts';
import { latLngToCoords, latLngsToCoords } from './lat-lng-to-coord';

let geometryFactory = new jsts.geom.GeometryFactory();

// convert coordinates in jsts object
let coordinatesFunction = function(coord, altitude) {
  return altitude ?
    new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
    new jsts.geom.Coordinate(coord.x, coord.y);
};

// for point
let latlngToPointJsts = function(latlng, crs, precision) {
  let coord = latLngToCoords(latlng, crs, precision, coordinatesFunction);
  let point = geometryFactory.createPoint(coord);

  if (point) {
    point.setSRID(crs.code.split(':')[1]);
  }

  return point;
};

// for polyline
let coordinatesToLineString = function (coordinates) {
  return geometryFactory.createLineString(coordinates);
};

let latlngToPolylineJsts = function (latlngs, crs, precision) {
  let multi = !L.LineUtil.isFlat(latlngs);
  let coords = latLngsToCoords(latlngs, crs, multi ? 1 : 0, false, precision, coordinatesFunction);

  let polyline;
  if (!multi) {
    polyline = coordinatesToLineString(coords);
  } else {
    let geometries = coords.map(coordinatesToLineString);
    polyline = geometryFactory.createMultiLineString(geometries);
  }

  if (polyline) {
    polyline.setSRID(crs.code.split(':')[1]);
  }

  return polyline;
};

// for polygon
let coordinatesToLinearRing = function(coordinates) {
  return geometryFactory.createLinearRing(coordinates);
};

let coordinatesToPolygon = function(coordinates) {
  let rings = coordinates.map(coordinatesToLinearRing);
  if (rings.length  < 2) {
    return geometryFactory.createPolygon(rings[0], []);
  } else {
    return geometryFactory.createPolygon(rings[0], rings.slice(1));
  }
};

let latlngToPolygonJsts = function(latlngs, crs, precision) {
  let holes = !L.LineUtil.isFlat(latlngs);
  let multi = holes && !L.LineUtil.isFlat(latlngs[0]);
  let coords = latLngsToCoords(latlngs, crs, multi ? 2 : holes ? 1 : 0, true, precision, coordinatesFunction);

  if (!holes) {
    coords = [coords];
  }

  let polygon;
  if (!multi) {
    polygon = coordinatesToPolygon(coords);
  } else {
    let geometries = coords.map(coordinatesToPolygon);
    polygon = geometryFactory.createMultiPolygon(geometries);
  }

  if (polygon) {
    polygon.setSRID(crs.code.split(':')[1]);
  }

  return polygon;
};

// all type
let coordToJsts = function(coord) {
  coord = (coord instanceof Array) ? coord : Array.from(coord);
  return coord.length === 3 ?
    new jsts.geom.Coordinate(coord[0], coord[1], coord[2]) :
      coord.length === 2 ?
        new jsts.geom.Coordinate(coord[0], coord[1]) :
        null;
};

let geometryPrecisionReducer = function(scale) {
  return new jsts.precision.GeometryPrecisionReducer(new jsts.geom.PrecisionModel(scale));
};

let geometryToJsts = function(geometry) {
  let coords = [];
  switch (geometry.type) {
    case 'Point':
      coords = coordToJsts(geometry.coordinates);
      return geometryFactory.createPoint(coords);
    case 'LineString':
      let coordsAsArray = geometry.coordinates instanceof Array ? geometry.coordinates : Array.from(geometry.coordinates);
      coords = coordsAsArray.map(coordToJsts);
      return coordinatesToLineString(coords);
    case 'MultiLineString':
      for (let i = 0; i < geometry.coordinates.length; i++) {
        let coordsAsArray = geometry.coordinates[i] instanceof Array ? geometry.coordinates[i] : Array.from(geometry.coordinates[i]);
        coords.push(coordsAsArray.map(coordToJsts));
      }

      let geometries = coords.map(coordinatesToLineString);
      return geometryFactory.createMultiLineString(geometries);
    case 'Polygon':
      for (let i = 0; i < geometry.coordinates.length; i++) {
        let coordsAsArray = geometry.coordinates[i] instanceof Array ? geometry.coordinates[i] : Array.from(geometry.coordinates[i]);
        coords.push(coordsAsArray.map(coordToJsts));
      }

      return coordinatesToPolygon(coords);
    case 'MultiPolygon':
      for (let i = 0; i < geometry.coordinates.length; i++) {
        let coordinates = [];
        for (let j = 0; j < geometry.coordinates[i].length; j++) {
          let coordsAsArray = geometry.coordinates[i][j] instanceof Array ? geometry.coordinates[i][j] : Array.from(geometry.coordinates[i][j]);
          coordinates.push(coordsAsArray.map(coordToJsts));
        }

        coords.push(coordinates);
      }

      let geom = coords.map(coordinatesToPolygon);
      return geometryFactory.createMultiPolygon(geom);
  }
};

export {
  latlngToPointJsts,
  latlngToPolylineJsts,
  latlngToPolygonJsts,
  geometryToJsts,
  geometryPrecisionReducer
};
