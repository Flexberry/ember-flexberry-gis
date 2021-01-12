/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Create object by rhumb for [LineString, Polygon]. Start point coordinates convert in crs of layer.
  Accepts angles in degrees, converting them to radians. Accepts names of direction is [NE, SE, NW, SW].
  Accepts distance in units accepted for CRS of layer. Calculation rhumb by point, distance and angle.
  Returns coordinates skipping 'skip' from the first rhumb in crs of layer.

  @method createObjectRhumb
  @param {Object} data Coordinate objects.
  Example:
  var data = {
        type: 'LineString',
        properties: { name: 'test_polygon' },
        startPoint: [85, 79],
        skip:0,
        points: [
          { rhumb: 'SE', angle: 86.76787457562546, distance: 8182.6375760837955 },
          { rhumb: 'NE', angle: 79.04259420114585, distance: 8476.868426796427 },
          { rhumb: 'SW', angle: 86.0047147391561, distance: 16532.122718537685 }
        ]
      };
  @returns {Object} New featureLayer.
*/
const createObjectRhumb = (data, layerCrs, that) => {
  if (Ember.isNone(data.points) || data.points.length === 0) {
    throw new Error('Not data.');
  }

  const type = data.type;
  if (Ember.isNone(type)) {
    throw new Error('Specify type.');
  } else {
    const polygonTypeSet = new Set(['LineString', 'Polygon']);
    if (!polygonTypeSet.has(type)) {
      throw new Error('Specified the wrong type.');
    }
  }

  // Get bearing in radian
  const getBearing = function (rhumb, angle) {
    let result;

    switch (rhumb) {
      case 'NE':
        result = parseFloat(angle);
        break;
      case 'SE':
        result = 180 - parseFloat(angle);
        break;
      case 'SW':
        result = parseFloat(angle) - 180;
        break;
      case 'NW':
        result = parseFloat(angle) * -1;
        break;
    }

    return result * Math.PI / 180;
  };

  // Calculation rhumb by point, distance (unit metre) and angle (unit radian).
  const rhumbToPoint = function (point, distance, angle) {
    let x = point[0] + distance * Math.sin(angle);
    let y = point[1] + distance * Math.cos(angle);

    return [x, y];
  };

  let coors = [];
  let startPointInCrs = data.startPoint;

  // startPoint transformed in crs of layer.
  if ((!Ember.isNone(data.crs) && data.crs !== layerCrs.code) || (Ember.isNone(data.crs))) {
    let knownCrs = Ember.getOwner(that).knownForType('coordinate-reference-system');
    let knownCrsArray = Ember.A(Object.values(knownCrs));
    if (!Ember.isNone(data.crs)) {
      let crs = knownCrsArray.findBy('code', data.crs).create();
      startPointInCrs = crs.unproject(L.point(data.startPoint[0], data.startPoint[1]));
    } else {
      startPointInCrs = layerCrs.unproject(L.point(data.startPoint[0], data.startPoint[1]));
    }

    let point = layerCrs.project(startPointInCrs);
    startPointInCrs = [point.x, point.y];
  }

  let startPoint;
  let coordinates = [];
  let skip = !Ember.isNone(data.skip) ? data.skip : 0;
  const vertexCount = data.points;

  for (let i = 0; i < vertexCount.length; i++) {
    const vertex = vertexCount[i];
    const bearing = getBearing(vertex.rhumb, vertex.angle);

    if (Ember.isNone(startPoint)) {
      startPoint = rhumbToPoint(startPointInCrs, vertex.distance, bearing);
      if (skip === 0) {
        if (type === 'Polygon') {
          coordinates.push(startPointInCrs);
        } else if (type === 'LineString') {
          coors.push(startPointInCrs);
        }
      }
    } else {
      startPoint = rhumbToPoint(startPoint, vertex.distance, bearing);
    }

    if (skip !== 0) {
      skip--;
    }

    if (skip === 0) {
      if (type === 'Polygon') {
        coordinates.push(startPoint);
      } else if (type === 'LineString') {
        coors.push(startPoint);
      }
    }
  }

  if (type === 'Polygon') {
    coors.push(coordinates);
  }

  const obj = {
    type: 'Feature',
    geometry: {
      type: type,
      coordinates: coors
    },
    properties: data.properties,
    crs: {
      type: 'name',
      properties: {
        name: layerCrs.code
      }
    }
  };

  return obj;
};

export {
  createObjectRhumb
};
