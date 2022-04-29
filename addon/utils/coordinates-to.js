/**
  Get the depth of the array.

  @method countDimensions
  @param {Object[]} value Array.
  @returns {number} value Array depth.
*/
let countDimensions = function(value) {
  return Array.isArray(value) ? 1 + Math.max(...value.map(countDimensions.bind(this))) : 0;
};

/**
  Converting coordinates to a single array.

  @method coordinatesToArray
  @param {Object[]} coordinates Coordinates.
*/
let coordinatesToArray = function(coordinates) {

  // Get array depth.
  const arrDepth = countDimensions(coordinates);

  let coors = [];
  switch (arrDepth) {
    case 1: // Point.
      coors.push(coordinates);
      break;
    case 2: // LineString.
      coors = coordinates;
      break;
    case 3: // Polygon and MultiLineString.
      for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates[i].length; j++) {
          let item = coordinates[i][j];
          coors.push(item);
        }

        if (i !== coordinates.length - 1) {
          coors.push(null);
        }
      }

      break;
    case 4: // MultiPolygon.
      for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates[i].length; j++) {
          for (let k = 0; k < coordinates[i][j].length; k++) {
            let item = coordinates[i][j][k];
            coors.push(item);
          }
        }

        if (i !== coordinates.length - 1) {
          coors.push(null);
        }
      }

      break;
    default:
      console.error('Coordinate array error.');
  }

  return coors;
};

/**
  Converting coordinates to string.

  @method coordinatesToString
  @param {Object[]} coordinates Coordinates.
*/
let coordinatesToString = function(coordinates) {
  let coords = coordinatesToArray(coordinates);
  let result = '';
  coords.forEach(item => {
    result += item !== null ? `${item[0]} ${item[1]} \n` : '\n';
  });

  return result;
};

export {
  coordinatesToString,
  coordinatesToArray
};
