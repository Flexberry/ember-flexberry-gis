import { latLngToCoords, latLngsToCoords } from 'ember-flexberry-gis/utils/lat-lng-to-coord';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { module, test } from 'qunit';
import jsts from 'npm:jsts';

module('Unit | Utility | lat lng to coord');

let crs = crsFactory4326.create();
let precision = 0;

test('test method latLngToCoords for Point', function(assert) {
  //Arrange
  let latlng = L.latLng(30, 10);
  let latlngWithAlt = L.latLng(30, 10, 20);
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  //Act
  let resCoord = latLngToCoords(latlng, crs, precision);
  let resCoordWithAlt = latLngToCoords(latlngWithAlt, crs, precision);
  let resCoordWithFunc = latLngToCoords(latlng, crs, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngToCoords(latlngWithAlt, crs, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [10, 30]);
  assert.deepEqual(resCoordWithAlt, [10, 30, 20]);
  assert.deepEqual(resCoordWithFunc.toString(), '(10, 30, undefined)');
  assert.deepEqual(resCoordWithAltAndFunc.toString(), '(10, 30, 20)');
});

test('test method latLngsToCoords for LineString', function(assert) {
  //Arrange
  let latlngs = [L.latLng(30, 10), L.latLng(10, 30), L.latLng(40, 40)];
  let latlngsWithAlt = [L.latLng(30, 10, 20), L.latLng(10, 30, 21), L.latLng(40, 40, 22)];
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  let levelsDeep = 0;
  let closed = false;

  //Act
  let resCoord = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision);
  let resCoordWithAlt = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision);
  let resCoordWithFunc = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [[10, 30], [30, 10], [40, 40]]);
  assert.deepEqual(resCoordWithAlt, [[10, 30, 20], [30, 10, 21], [40, 40, 22]]);
  assert.deepEqual(resCoordWithFunc.toString(), '(10, 30, undefined),(30, 10, undefined),(40, 40, undefined)');
  assert.deepEqual(resCoordWithAltAndFunc.toString(), '(10, 30, 20),(30, 10, 21),(40, 40, 22)');
});

test('test method latLngsToCoords for MultiLineString', function(assert) {
  //Arrange
  let latlngs = [
    [L.latLng(10, 10), L.latLng(20, 20), L.latLng(10, 40)],
    [L.latLng(40, 40), L.latLng(30, 30), L.latLng(40, 20)]
  ];
  let latlngsWithAlt = [
    [L.latLng(10, 10, 20), L.latLng(20, 20, 21), L.latLng(10, 40, 22)],
    [L.latLng(40, 40, 23), L.latLng(30, 30, 24), L.latLng(40, 20, 25)]
  ];
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  let levelsDeep = 1;
  let closed = false;

  //Act
  let resCoord = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision);
  let resCoordWithAlt = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision);
  let resCoordWithFunc = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [
    [[10, 10], [20, 20], [40, 10]],
    [[40, 40], [30, 30], [20, 40]]
  ]);
  assert.deepEqual(resCoordWithAlt, [
    [[10, 10, 20], [20, 20, 21], [40, 10, 22]],
    [[40, 40, 23], [30, 30, 24], [20, 40, 25]]
  ]);
  assert.equal(resCoordWithFunc.length, 2);
  assert.deepEqual(resCoordWithFunc[0].toString(), '(10, 10, undefined),(20, 20, undefined),(40, 10, undefined)');
  assert.deepEqual(resCoordWithFunc[1].toString(), '(40, 40, undefined),(30, 30, undefined),(20, 40, undefined)');
  assert.equal(resCoordWithAltAndFunc.length, 2);
  assert.deepEqual(resCoordWithAltAndFunc[0].toString(), '(10, 10, 20),(20, 20, 21),(40, 10, 22)');
  assert.deepEqual(resCoordWithAltAndFunc[1].toString(), '(40, 40, 23),(30, 30, 24),(20, 40, 25)');
});

test('test method latLngsToCoords for Polygon without hole', function(assert) {
  //Arrange
  let latlngs = [
    [L.latLng(30, 10), L.latLng(40, 40), L.latLng(20, 40), L.latLng(10, 20)]
  ];
  let latlngsWithAlt = [
    [L.latLng(30, 10, 20), L.latLng(40, 40, 21), L.latLng(20, 40, 22), L.latLng(10, 20, 23)]
  ];
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  let levelsDeep = 1;
  let closed = true;

  //Act
  let resCoord = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision);
  let resCoordWithAlt = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision);
  let resCoordWithFunc = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [
    [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
  ]);
  assert.deepEqual(resCoordWithAlt, [
    [[10, 30, 20], [40, 40, 21], [40, 20, 22], [20, 10, 23], [10, 30, 20]]
  ]);
  assert.deepEqual(resCoordWithFunc.toString(), '(10, 30, undefined),(40, 40, undefined),(40, 20, undefined)' +
    ',(20, 10, undefined),(10, 30, undefined)');
  assert.deepEqual(resCoordWithAltAndFunc.toString(), '(10, 30, 20),(40, 40, 21),(40, 20, 22)' +
    ',(20, 10, 23),(10, 30, 20)');
});

test('test method latLngsToCoords for Polygon with hole', function(assert) {
  //Arrange
  let latlngs = [
    [L.latLng(35, 10), L.latLng(45, 45), L.latLng(15, 40), L.latLng(10, 20)],
    [L.latLng(20, 30), L.latLng(35, 35), L.latLng(30, 20)]
  ];
  let latlngsWithAlt = [
    [L.latLng(35, 10, 20), L.latLng(45, 45, 21), L.latLng(15, 40, 22), L.latLng(10, 20, 23)],
    [L.latLng(20, 30, 24), L.latLng(35, 35, 25), L.latLng(30, 20, 26)]
  ];
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  let levelsDeep = 1;
  let closed = true;

  //Act
  let resCoord = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision);
  let resCoordWithAlt = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision);
  let resCoordWithFunc = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [
    [[10, 35], [45, 45], [40, 15], [20, 10], [10, 35]],
    [[30, 20], [35, 35], [20, 30], [30, 20]]
  ]);
  assert.deepEqual(resCoordWithAlt, [
    [[10, 35, 20], [45, 45, 21], [40, 15, 22], [20, 10, 23], [10, 35, 20]],
    [[30, 20, 24], [35, 35, 25], [20, 30, 26], [30, 20, 24]]
  ]);
  assert.deepEqual(resCoordWithFunc[0].toString(), '(10, 35, undefined),(45, 45, undefined),(40, 15, undefined)' +
    ',(20, 10, undefined),(10, 35, undefined)');
  assert.deepEqual(resCoordWithFunc[1].toString(), '(30, 20, undefined),(35, 35, undefined),(20, 30, undefined),' +
    '(30, 20, undefined)');
  assert.deepEqual(resCoordWithAltAndFunc[0].toString(), '(10, 35, 20),(45, 45, 21),(40, 15, 22)' +
    ',(20, 10, 23),(10, 35, 20)');
  assert.deepEqual(resCoordWithAltAndFunc[1].toString(), '(30, 20, 24),(35, 35, 25),(20, 30, 26),' +
    '(30, 20, 24)');
});

test('test method latLngsToCoords for MultiPolygon without hole', function(assert) {
  //Arrange
  let latlngs = [
    [[L.latLng(30, 20), L.latLng(45, 40), L.latLng(10, 40)]],
    [[L.latLng(15, 5), L.latLng(40, 10), L.latLng(10, 20), L.latLng(5, 10)]]
  ];
  let latlngsWithAlt = [
    [[L.latLng(30, 20, 20), L.latLng(45, 40, 21), L.latLng(10, 40, 22)]],
    [[L.latLng(15, 5, 23), L.latLng(40, 10, 24), L.latLng(10, 20, 25), L.latLng(5, 10, 26)]]
  ];
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  let levelsDeep = 2;
  let closed = true;

  //Act
  let resCoord = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision);
  let resCoordWithAlt = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision);
  let resCoordWithFunc = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [
    [
      [[20, 30], [40, 45], [40, 10], [20, 30]]
    ],
    [
      [[5, 15], [10, 40], [20, 10], [10, 5], [5, 15]]
    ]
  ]);
  assert.deepEqual(resCoordWithAlt, [
    [
      [[20, 30, 20], [40, 45, 21], [40, 10, 22], [20, 30, 20]]
    ],
    [
      [[5, 15, 23], [10, 40, 24], [20, 10, 25], [10, 5, 26], [5, 15, 23]]
    ]
  ]);
  assert.deepEqual(resCoordWithFunc[0][0].toString(), '(20, 30, undefined),(40, 45, undefined),(40, 10, undefined),(20, 30, undefined)');
  assert.deepEqual(resCoordWithFunc[1][0].toString(), '(5, 15, undefined),(10, 40, undefined),(20, 10, undefined),(10, 5, undefined)' +
    ',(5, 15, undefined)');
  assert.deepEqual(resCoordWithAltAndFunc[0][0].toString(), '(20, 30, 20),(40, 45, 21),(40, 10, 22),(20, 30, 20)');
  assert.deepEqual(resCoordWithAltAndFunc[1][0].toString(), '(5, 15, 23),(10, 40, 24),(20, 10, 25),(10, 5, 26)' +
    ',(5, 15, 23)');
});

test('test method latLngsToCoords for MultiPolygon with hole', function(assert) {
  //Arrange
  let latlngs = [
    [[L.latLng(40, 40), L.latLng(20, 45), L.latLng(45, 30)]],
    [
      [L.latLng(20, 35), L.latLng(10, 30), L.latLng(10, 10), L.latLng(30, 5), L.latLng(45, 20)],
      [L.latLng(30, 20), L.latLng(20, 15), L.latLng(20, 25)]
    ]
  ];
  let latlngsWithAlt = [
    [[L.latLng(40, 40, 20), L.latLng(20, 45, 21), L.latLng(45, 30, 22)]],
    [
      [L.latLng(20, 35, 24), L.latLng(10, 30, 25), L.latLng(10, 10, 26), L.latLng(30, 5, 27), L.latLng(45, 20, 28)],
      [L.latLng(30, 20, 29), L.latLng(20, 15, 30), L.latLng(20, 25, 31)]
    ]
  ];
  let coordinatesFunction = function(coord, altitude) {
    return altitude ?
      new jsts.geom.Coordinate(coord.x, coord.y, altitude) :
      new jsts.geom.Coordinate(coord.x, coord.y);
  };

  let levelsDeep = 2;
  let closed = true;

  //Act
  let resCoord = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision);
  let resCoordWithAlt = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision);
  let resCoordWithFunc = latLngsToCoords(latlngs, crs, levelsDeep, closed, precision, coordinatesFunction);
  let resCoordWithAltAndFunc = latLngsToCoords(latlngsWithAlt, crs, levelsDeep, closed, precision, coordinatesFunction);

  //Assert
  assert.deepEqual(resCoord, [
    [
      [[40, 40], [45, 20], [30, 45], [40, 40]]
    ],
    [
      [[35, 20], [30, 10], [10, 10], [5, 30], [20, 45], [35, 20]],
      [[20, 30], [15, 20], [25, 20], [20, 30]]
    ]
  ]);
  assert.deepEqual(resCoordWithAlt, [
    [
      [[40, 40, 20], [45, 20, 21], [30, 45, 22], [40, 40, 20]]
    ],
    [
      [[35, 20, 24], [30, 10, 25], [10, 10, 26], [5, 30, 27], [20, 45, 28], [35, 20, 24]],
      [[20, 30, 29], [15, 20, 30], [25, 20, 31], [20, 30, 29]]
    ]
  ]);
  assert.deepEqual(resCoordWithFunc[0][0].toString(), '(40, 40, undefined),(45, 20, undefined),(30, 45, undefined),(40, 40, undefined)');
  assert.deepEqual(resCoordWithFunc[1][0].toString(), '(35, 20, undefined),(30, 10, undefined),(10, 10, undefined)' +
    ',(5, 30, undefined),(20, 45, undefined),(35, 20, undefined)');
  assert.deepEqual(resCoordWithFunc[1][1].toString(), '(20, 30, undefined),(15, 20, undefined),(25, 20, undefined),' +
    '(20, 30, undefined)');
  assert.deepEqual(resCoordWithAltAndFunc[0][0].toString(), '(40, 40, 20),(45, 20, 21),(30, 45, 22),(40, 40, 20)');
  assert.deepEqual(resCoordWithAltAndFunc[1][0].toString(), '(35, 20, 24),(30, 10, 25),(10, 10, 26)' +
    ',(5, 30, 27),(20, 45, 28),(35, 20, 24)');
  assert.deepEqual(resCoordWithAltAndFunc[1][1].toString(), '(20, 30, 29),(15, 20, 30),(25, 20, 31),' +
    '(20, 30, 29)');
});
