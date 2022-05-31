import { isNone } from '@ember/utils';
import jsts from 'npm:jsts';
import { latLngToCoords, latLngsToCoords } from './lat-lng-to-coord';

const geometryFactory = new jsts.geom.GeometryFactory();
let geometryReducer = null;

// convert coordinates in jsts object
const coordinatesFunction = function (coord, altitude) {
  return altitude
    ? new jsts.geom.Coordinate(coord.x, coord.y, altitude)
    : new jsts.geom.Coordinate(coord.x, coord.y);
};

const geometryPrecisionReducer = function (scale) {
  if (geometryReducer === null) {
    geometryReducer = new jsts.precision.GeometryPrecisionReducer(new jsts.geom.PrecisionModel(scale));
  }

  return geometryReducer;
};

// for point
const latlngToPointJsts = function (latlng, crs, precision, scale) {
  const coord = latLngToCoords(latlng, crs, precision, coordinatesFunction);
  let point = geometryFactory.createPoint(coord);
  if (!isNone(scale)) {
    point = geometryPrecisionReducer(scale).reduce(point);
  }

  if (point) {
    point.setSRID(crs.code.split(':')[1]);
  }

  return point;
};

// for polyline
const coordinatesToLineString = function (coordinates) {
  return geometryFactory.createLineString(coordinates);
};

const latlngToPolylineJsts = function (latlngs, crs, precision, scale) {
  const multi = !L.LineUtil.isFlat(latlngs);
  const coords = latLngsToCoords(latlngs, crs, multi ? 1 : 0, false, precision, coordinatesFunction);

  let polyline;
  if (!multi) {
    polyline = coordinatesToLineString(coords);
  } else {
    const geometries = coords.map(coordinatesToLineString);
    polyline = geometryFactory.createMultiLineString(geometries);
  }

  if (!isNone(scale)) {
    polyline = geometryPrecisionReducer(scale).reduce(polyline);
  }

  if (polyline) {
    polyline.setSRID(crs.code.split(':')[1]);
  }

  return polyline;
};

// for polygon
const coordinatesToLinearRing = function (coordinates) {
  return geometryFactory.createLinearRing(coordinates);
};

const coordinatesToPolygon = function (coordinates) {
  const rings = coordinates.map(coordinatesToLinearRing);
  if (rings.length < 2) {
    return geometryFactory.createPolygon(rings[0], []);
  }

  return geometryFactory.createPolygon(rings[0], rings.slice(1));
};

const latlngToPolygonJsts = function (latlngs, crs, precision, scale) {
  const holes = !L.LineUtil.isFlat(latlngs) ? 1 : 0;
  const multi = holes && !L.LineUtil.isFlat(latlngs[0]);
  const levelsDeep = multi ? 2 : holes;
  let coords = latLngsToCoords(latlngs, crs, levelsDeep, true, precision, coordinatesFunction);

  if (!holes) {
    coords = [coords];
  }

  let polygon;
  if (!multi) {
    polygon = coordinatesToPolygon(coords);
  } else {
    const geometries = coords.map(coordinatesToPolygon);
    polygon = geometryFactory.createMultiPolygon(geometries);
  }

  if (!isNone(scale)) {
    polygon = geometryPrecisionReducer(scale).reduce(polygon);
  }

  if (polygon) {
    polygon.setSRID(crs.code.split(':')[1]);
  }

  return polygon;
};

// all type
const coordToJsts = function (coord) {
  coord = (coord instanceof Array) ? coord : Array.from(coord);
  let value;
  if (coord.length === 3) {
    value = new jsts.geom.Coordinate(coord[0], coord[1], coord[2]);
  } else if (coord.length === 2) {
    value = new jsts.geom.Coordinate(coord[0], coord[1]);
  } else {
    value = null;
  }

  return value;
};

const geometryToJsts = function (geometry, scale) {
  let coords = [];
  switch (geometry.type) {
    case 'Point': {
      coords = coordToJsts(geometry.coordinates);
      const point = geometryFactory.createPoint(coords);
      return isNone(scale) ? point : geometryPrecisionReducer(scale).reduce(point);
    }
    case 'LineString': {
      const coordsAsArray = geometry.coordinates instanceof Array ? geometry.coordinates : Array.from(geometry.coordinates);
      coords = coordsAsArray.map(coordToJsts);
      const line = coordinatesToLineString(coords);
      return isNone(scale) ? line : geometryPrecisionReducer(scale).reduce(line);
    }
    case 'MultiLineString': {
      for (let i = 0; i < geometry.coordinates.length; i++) {
        const coordsAsArray = geometry.coordinates[i] instanceof Array ? geometry.coordinates[i] : Array.from(geometry.coordinates[i]);
        coords.push(coordsAsArray.map(coordToJsts));
      }

      const geometries = coords.map(coordinatesToLineString);
      const multiLine = geometryFactory.createMultiLineString(geometries);
      return isNone(scale) ? multiLine : geometryPrecisionReducer(scale).reduce(multiLine);
    }
    case 'Polygon': {
      for (let i = 0; i < geometry.coordinates.length; i++) {
        const coordsAsArray = geometry.coordinates[i] instanceof Array ? geometry.coordinates[i] : Array.from(geometry.coordinates[i]);
        coords.push(coordsAsArray.map(coordToJsts));
      }

      const polygon = coordinatesToPolygon(coords);
      return isNone(scale) ? polygon : geometryPrecisionReducer(scale).reduce(polygon);
    }
    case 'MultiPolygon': {
      for (let i = 0; i < geometry.coordinates.length; i++) {
        const coordinates = [];
        for (let j = 0; j < geometry.coordinates[i].length; j++) {
          const coordsAsArray = geometry.coordinates[i][j] instanceof Array ? geometry.coordinates[i][j] : Array.from(geometry.coordinates[i][j]);
          coordinates.push(coordsAsArray.map(coordToJsts));
        }

        coords.push(coordinates);
      }

      const geom = coords.map(coordinatesToPolygon);
      const multiPolygon = geometryFactory.createMultiPolygon(geom);
      return isNone(scale) ? multiPolygon : geometryPrecisionReducer(scale).reduce(multiPolygon);
    }
    default:
  }
};

export {
  latlngToPointJsts,
  latlngToPolylineJsts,
  latlngToPolygonJsts,
  geometryToJsts,
  geometryPrecisionReducer
};
