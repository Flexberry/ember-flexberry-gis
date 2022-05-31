import { latLngToCoords } from './lat-lng-to-coord';

// convert coordinates in jsts object
const coordinatesFunction = function (coord, altitude) {
  return altitude
    ? `${coord.x} ${coord.y} ${altitude}`
    : `${coord.x} ${coord.y}`;
};

const latLngsToCoords = function (latlngs, crs, levelsDeep, closed, precision) {
  let coords = '';
  let coordClose = '';
  for (let i = 0, len = latlngs.length; i < len; i++) {
    let coord;
    if (!levelsDeep) {
      coord = latLngToCoords(latlngs[i], crs, precision, coordinatesFunction)
        + ((i === len - 1 && latlngs[i] instanceof L.LatLng) ? '' : ', ');

      if (closed && latlngs[i] instanceof L.LatLng) {
        if (i === 0) {
          coordClose = coord.slice(0, -2);
        }

        if (i === len - 1) {
          coord += `, ${coordClose}`;
        }
      }
    }

    coords += (levelsDeep
      ? `(${latLngsToCoords(latlngs[i], crs, levelsDeep - 1, closed, precision, coordinatesFunction)})${i === len - 1 ? '' : ', '}`
      : coord);
  }

  return coords;
};

const doEWKT = function (crs, type, coord) {
  return `SRID=${crs.code.split(':')[1]};${type}(${coord})`;
};

// for point
const latlngToPointEWKT = function (latlng, crs, precision) {
  const coord = latLngToCoords(latlng, crs, precision, coordinatesFunction);
  return doEWKT(crs, 'POINT', coord);
};

// for polyline
const latlngToPolylineEWKT = function (latlngs, crs, precision) {
  const multi = !L.LineUtil.isFlat(latlngs);
  const coords = latLngsToCoords(latlngs, crs, multi ? 1 : 0, false, precision, coordinatesFunction);
  const type = `${multi ? 'MULTI' : ''}LINESTRING`;
  return doEWKT(crs, type, coords);
};

// for polygon
const latlngToPolygonEWKT = function (latlngs, crs, precision) {
  const holes = !L.LineUtil.isFlat(latlngs);
  const multi = holes && !L.LineUtil.isFlat(latlngs[0]);
  let param;
  if (multi) {
    param = 2;
  } else if (holes) {
    param = 1;
  } else {
    param = 0;
  }

  let coords = latLngsToCoords(latlngs, crs, param, true, precision, coordinatesFunction);

  if (!holes) {
    coords += `(${coords[0]})`;
  }

  const type = `${multi ? 'MULTI' : ''}POLYGON`;
  return doEWKT(crs, type, coords);
};

export {
  latlngToPointEWKT,
  latlngToPolylineEWKT,
  latlngToPolygonEWKT
};
