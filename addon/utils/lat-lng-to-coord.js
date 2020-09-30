import jsts from 'npm:jsts';

/**
  Projects geographical coordinates point into coordinates in units accepted for this crs and specified precision.

  @method latLngToCoords
  @param {Object} latlng Geographical coordinates.
  @param {Object} crs Coordinate reference system in which to transform coordinates.
  @param {Number} precision Number of decimal places for coordinates
  @param {Boolean} isJsts Flag: indicates whether need return coordinates in jsts.
  @returns {Array} Array of coordinates.
*/
let latLngToCoords = function(latlng, crs, precision, isJsts = false) {
  var coord = crs.project(latlng);
  if (!isJsts) {
    return latlng.alt !== undefined ?
      [coord.x, coord.y, latlng.alt] :
      [coord.x, coord.y];
  } else {
    return latlng.alt !== undefined ?
      new jsts.geom.Coordinate(coord.x, coord.y, latlng.alt) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  }
};

/**
  Projects geographical coordinates into coordinates in units accepted for this crs.

  @method latLngsToCoords
  @param {Array} latlngs Array of geographical coordinates.
  @param {Object} crs Coordinate reference system in which to transform coordinates.
  @param {Number} levelsDeep Level of deep.
  @param {Boolean} closed Determines whether the first point should be appended to the end of the array to close the feature.
  @param {Number} precision Number of decimal places for coordinates
  @param {Boolean} isJsts Flag: indicates whether need return coordinates in jsts.
  @returns {Array} Array of coordinates.
*/
let latLngsToCoords = function(latlngs, crs, levelsDeep, closed, precision, isJsts = false) {
  var coords = [];

  for (var i = 0, len = latlngs.length; i < len; i++) {
    coords.push(levelsDeep ?
      latLngsToCoords(latlngs[i], crs, levelsDeep - 1, closed, precision, isJsts) :
      latLngToCoords(latlngs[i], crs, precision, isJsts));
  }

  if (!levelsDeep && closed) {
    coords.push(coords[0]);
  }

  return coords;
};

export {
  latLngToCoords,
  latLngsToCoords
};
