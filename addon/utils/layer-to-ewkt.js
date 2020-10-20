import { latLngToCoords } from './lat-lng-to-coord';

// convert coordinates in jsts object
let coordinatesFunction = function(coord, altitude) {
  return altitude ?
    `${coord.x} ${coord.y} ${altitude}` :
    `${coord.x} ${coord.y}`;
};

let latLngsToCoords = function(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction) {
  let coords = '';
  let coordClose = '';
  for (let i = 0, len = latlngs.length; i < len; i++) {
    let coord;
    if (!levelsDeep) {
      coord = latLngToCoords(latlngs[i], crs, precision, coordinatesFunction) +
        ((i === len - 1 && latlngs[i] instanceof L.LatLng) ? '' : ', ');

      if (closed && latlngs[i] instanceof L.LatLng) {
        if (i === 0) {
          coordClose = coord.slice(0, -2);
        }

        if (i === len - 1) {
          coord += ', ' + coordClose;
        }
      }
    }

    coords += (levelsDeep ?
      '(' + latLngsToCoords(latlngs[i], crs, levelsDeep - 1, closed, precision, coordinatesFunction) + ')' + (i === len - 1 ? '' : ', ') :
      coord);
  }

  return coords;
};

let doEWKT = function(crs, type, coord) {
  return `SRID=${crs.code.split(':')[1]};${type}(${coord})`;
};

// for point
let latlngToPointEWKT = function(latlng, crs, precision) {
  let coord = latLngToCoords(latlng, crs, precision, coordinatesFunction);
  return doEWKT(crs, 'POINT', coord);
};

// for polyline
let latlngToPolylineEWKT = function (latlngs, crs, precision) {
  let multi = !L.LineUtil.isFlat(latlngs);
  let coords = latLngsToCoords(latlngs, crs, multi ? 1 : 0, false, precision, coordinatesFunction);
  let type = (multi ? 'MULTI' : '') + 'LINESTRING';
  return doEWKT(crs, type, coords);
};

// for polygon
let latlngToPolygonEWKT = function(latlngs, crs, precision) {
  let holes = !L.LineUtil.isFlat(latlngs);
  let multi = holes && !L.LineUtil.isFlat(latlngs[0]);
  let coords = latLngsToCoords(latlngs, crs, multi ? 2 : holes ? 1 : 0, true, precision, coordinatesFunction);

  if (!holes) {
    coords += '(' + coords[0] + ')';
  }

  let type = (multi ? 'MULTI' : '') + 'POLYGON';
  return doEWKT(crs, type, coords);
};

export {
  latlngToPointEWKT,
  latlngToPolylineEWKT,
  latlngToPolygonEWKT
};
