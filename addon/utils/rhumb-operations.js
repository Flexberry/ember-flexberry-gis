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
        points: [
          { rib: '1;2', rhumb: 'ЮВ;86.76787457562546', distance: 8182.6375760837955 },
          { rib: '2;3', rhumb: 'СВ;79.04259420114585', distance: 8476.868426796427 },
          { rib: '3;1', rhumb: 'ЮЗ;86.0047147391561', distance: 16532.122718537685 }
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

  const points = data.points;

  const degreeToRadian = function (degree) {
    let deg;
    let min = 0;
    let sec = 0;

    const regex = /^([0-8]?[0-9]|90)°([0-5]?[0-9]')?([0-5]?[0-9](,[0-9]*)?")?$/gm;
    let m;

    while ((m = regex.exec(degree)) !== null) {

      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);

        if (!Ember.isNone(match)) {
          switch (groupIndex) {
            case 1:
              deg = parseInt(match);
              break;
            case 2:
              min = parseInt(match.replace("'", ''));
              break;
            case 3:
              sec = parseFloat(match.replace(`"`, '').replace(',', '.'));
              break;
          }
        }
      });
    }

    return deg + min / 60 + sec / 3600;
  };

  const getBearing = function (rhumb) {
    let result;
    const arr = rhumb.split(';');
    const direct = arr[0];

    // Convert to radians
    let degree = arr[1].indexOf('°') > 0 ? degreeToRadian(arr[1]) : arr[1];

    switch (direct) {
      case 'СВ':
        result = parseFloat(degree);
        break;
      case 'ЮВ':
        result = 180 - parseFloat(degree);
        break;
      case 'ЮЗ':
        result = parseFloat(degree) - 180;
        break;
      case 'СЗ':
        result = parseFloat(degree) * -1;
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

  if (type === 'Polygon') {
    let startPoint;
    let coordinates = [];

    // Rib sorting
    const vertexCount = points.sort((a, b) => a.rib.split(';')[0] - b.rib.split(';')[0]);

    for (let i = 0; i < vertexCount.length; i++) {
      const vertex = vertexCount[i];

      const bearing = getBearing(vertex.rhumb);

      // Convert to kilometers
      vertex.distance = vertex.distance / 1000;

      if (Ember.isNone(startPoint)) {
        startPoint = rhumbDestination.default(startPointInCrs, vertex.distance, bearing, { units: 'kilometers' });
      } else {
        startPoint = rhumbDestination.default(startPoint, vertex.distance, bearing, { units: 'kilometers' });
      }

      coordinates.push(startPoint.geometry.coordinates);
    }

    coors.push(coordinates);

    for (let i = 0; i < coors.length; i++) {
      for (let j = 0; j < coors[i].length; j++) {
        coors[i][j] = [coors[i][j][0], coors[i][j][1]];
      }
    }
  }

  if (type === 'LineString') {
    let startPoint;

    //Rib sorting
    const vertexCount = points.sort((a, b) => a.rib.split(';')[0] - b.rib.split(';')[0]);

    for (let i = 0; i < vertexCount.length; i++) {
      const vertex = vertexCount[i];
      const bearing = getBearing(vertex.rhumb);

      // Convert to kilometers
      vertex.distance = vertex.distance / 1000;

      if (Ember.isNone(startPoint)) {
        startPoint = rhumbDestination.default(startPointInCrs, vertex.distance, bearing, { units: 'kilometers' });
      } else {
        startPoint = rhumbDestination.default(startPoint, vertex.distance, bearing, { units: 'kilometers' });
      }

      coors.push(startPoint.geometry.coordinates);
    }

    for (let i = 0; i < coors.length; i++) {
      coors[i] = [coors[i][0], coors[i][1]];
    }
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
