/**
  Projects geographical coordinates point into coordinates in units accepted for this crs and specified precision.

  @method latLngToCoords
  @param {Object} latlng Geographical coordinates.
  @param {Object} crs Coordinate reference system in which to transform coordinates.
  @param {Number} precision Number of decimal places for coordinates
  @param {Function} coordinatesFunction Function for getting coordinates.
  @returns {Array} Array of coordinates.
*/
let latLngToCoords = function(latlng, crs, precision, coordinatesFunction) {
  var coord = crs.project(latlng);
  if (typeof (coordinatesFunction) !== 'function') {
    return latlng.alt !== undefined ?
    [coord.x, coord.y, latlng.alt] :
    [coord.x, coord.y];
  } else {
    return coordinatesFunction(coord, latlng.alt);
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
  @param {Function} coordinatesFunction Function for getting coordinates.
  @returns {Array} Array of coordinates.
*/
let latLngsToCoords = function(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction) {
  var coords = [];

  for (var i = 0, len = latlngs.length; i < len; i++) {
    coords.push(levelsDeep ?
      latLngsToCoords(latlngs[i], crs, levelsDeep - 1, closed, precision, coordinatesFunction) :
      latLngToCoords(latlngs[i], crs, precision, coordinatesFunction));
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
