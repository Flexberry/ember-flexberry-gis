/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import rhumbDestination from 'npm:@turf/rhumb-destination';
import helpers from 'npm:@turf/helpers';
import { getLeafletCrs } from '../utils/leaflet-crs';

/**
  Create polygon object by rhumb.

  @method createPolygonObjectRhumb
  @param {Object} data Coordinate objects.
  Example:
  var data = {
        type: 'LineString',
        properties: { name: 'test_polygon' },
        startPoint: [85, 79],
        skip:0,
        points: [
          { rhumb: 'ЮВ', angle: 86.76787457562546, distance: 8182.6375760837955 },
          { rhumb: 'СВ', angle: 79.04259420114585, distance: 8476.868426796427 },
          { rhumb: 'ЮЗ', angle: 86.0047147391561, distance: 16532.122718537685 }
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

  const getBearing = function (rhumb, angle) {
    let result;

    switch (rhumb) {
      case 'СВ':
        result = parseFloat(angle);
        break;
      case 'ЮВ':
        result = 180 - parseFloat(angle);
        break;
      case 'ЮЗ':
        result = parseFloat(angle) - 180;
        break;
      case 'СЗ':
        result = parseFloat(angle) * -1;
        break;
    }

    return result;
  };

  let coors = [];

  // CRS
  let startPointInCrs = helpers.point(data.startPoint);
  if ((!Ember.isNone(data.crs) && data.crs !== 'EPSG:4326') || (Ember.isNone(data.crs) && layerCrs.code !== 'EPSG:4326')) {
    if (!Ember.isNone(data.crs)) {
      let crs = getLeafletCrs('{ "code": "' + data.crs + '", "definition": "" }', that);
      startPointInCrs = crs.unproject(L.point(data.startPoint[0], data.startPoint[1]));
    } else {
      startPointInCrs = layerCrs.unproject(L.point(data.startPoint[0], data.startPoint[1]));
    }

    let crs = getLeafletCrs('{ "code": "EPSG:4326", "definition": "" }', that);
    let point = crs.project(startPointInCrs);
    startPointInCrs = helpers.point([point.x, point.y]);
  }

  let startPoint;
  let coordinates = [];
  let skip = !Ember.isNone(data.skip) ? data.skip : 0;
  const vertexCount = data.points;

  for (let i = 0; i < vertexCount.length; i++) {
    const vertex = vertexCount[i];
    const bearing = getBearing(vertex.rhumb, vertex.angle);

    // Convert to kilometers
    vertex.distance = vertex.distance / 1000;

    if (Ember.isNone(startPoint)) {
      startPoint = rhumbDestination.default(startPointInCrs, vertex.distance, bearing, { units: 'kilometers' });
      if (skip === 0) {
        if (type === 'Polygon') {
          coordinates.push(startPointInCrs.geometry.coordinates);
        } else if (type === 'LineString') {
          coors.push(startPointInCrs.geometry.coordinates);
        }
      }
    } else {
      startPoint = rhumbDestination.default(startPoint, vertex.distance, bearing, { units: 'kilometers' });
    }

    if (skip !== 0) {
      skip--;
    }

    if (skip === 0) {
      if (type === 'Polygon') {
        coordinates.push(startPoint.geometry.coordinates);
      } else if (type === 'LineString') {
        coors.push(startPoint.geometry.coordinates);
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
    properties: data.properties
  };

  return obj;
};

export {
  createObjectRhumb
};
