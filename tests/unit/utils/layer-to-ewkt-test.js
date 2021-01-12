import { latlngToPointEWKT, latlngToPolylineEWKT, latlngToPolygonEWKT } from 'ember-flexberry-gis/utils/layer-to-ewkt';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { module, test } from 'qunit';

module('Unit | Utility | layer to ewkt');

let crs = crsFactory4326.create();

test('test method latLngsToCoords for Point', function(assert) {
  //Arrange
  let latlng = L.latLng(30, 10);
  let latlngWithAlt = L.latLng(30, 10, 20);

  //Act
  let result = latlngToPointEWKT(latlng, crs);
  let resultWithAlt = latlngToPointEWKT(latlngWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;POINT(10 30)');
  assert.equal(resultWithAlt, 'SRID=4326;POINT(10 30 20)');
});

test('test method latlngToPolylineEWKT for LineString', function(assert) {
  //Arrange
  let latlng = [L.latLng(30, 10), L.latLng(10, 30), L.latLng(40, 40)];
  let latlngWithAlt = [L.latLng(30, 10, 20), L.latLng(10, 30, 21), L.latLng(40, 40, 22)];

  //Act
  let result = latlngToPolylineEWKT(latlng, crs);
  let resultWithAlt = latlngToPolylineEWKT(latlngWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;LINESTRING(10 30, 30 10, 40 40)');
  assert.equal(resultWithAlt, 'SRID=4326;LINESTRING(10 30 20, 30 10 21, 40 40 22)');
});

test('test method latlngToPolylineEWKT for MultiLineString', function(assert) {
  //Arrange
  let latlng = [
    [L.latLng(10, 10), L.latLng(20, 20), L.latLng(10, 40)],
    [L.latLng(40, 40), L.latLng(30, 30), L.latLng(40, 20)]
  ];
  let latlngsWithAlt = [
    [L.latLng(10, 10, 20), L.latLng(20, 20, 21), L.latLng(10, 40, 22)],
    [L.latLng(40, 40, 23), L.latLng(30, 30, 24), L.latLng(40, 20, 25)]
  ];

  //Act
  let result = latlngToPolylineEWKT(latlng, crs);
  let resultWithAlt = latlngToPolylineEWKT(latlngsWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;MULTILINESTRING((10 10, 20 20, 40 10), (40 40, 30 30, 20 40))');
  assert.equal(resultWithAlt, 'SRID=4326;MULTILINESTRING((10 10 20, 20 20 21, 40 10 22), (40 40 23, 30 30 24, 20 40 25))');
});

test('test method latlngToPolygonEWKT for Polygon without hole', function(assert) {
  //Arrange
  let latlng = [
    [L.latLng(30, 10), L.latLng(40, 40), L.latLng(20, 40), L.latLng(10, 20)]
  ];
  let latlngsWithAlt = [
    [L.latLng(30, 10, 20), L.latLng(40, 40, 21), L.latLng(20, 40, 22), L.latLng(10, 20, 23)]
  ];

  //Act
  let result = latlngToPolygonEWKT(latlng, crs);
  let resultWithAlt = latlngToPolygonEWKT(latlngsWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;POLYGON((10 30, 40 40, 40 20, 20 10, 10 30))');
  assert.equal(resultWithAlt, 'SRID=4326;POLYGON((10 30 20, 40 40 21, 40 20 22, 20 10 23, 10 30 20))');
});

test('test method latlngToPolygonEWKT for Polygon with hole', function(assert) {
  //Arrange
  let latlng = [
    [L.latLng(35, 10), L.latLng(45, 45), L.latLng(15, 40), L.latLng(10, 20)],
    [L.latLng(20, 30), L.latLng(35, 35), L.latLng(30, 20)]
  ];
  let latlngsWithAlt = [
    [L.latLng(35, 10, 20), L.latLng(45, 45, 21), L.latLng(15, 40, 22), L.latLng(10, 20, 23)],
    [L.latLng(20, 30, 24), L.latLng(35, 35, 25), L.latLng(30, 20, 26)]
  ];

  //Act
  let result = latlngToPolygonEWKT(latlng, crs);
  let resultWithAlt = latlngToPolygonEWKT(latlngsWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;POLYGON((10 35, 45 45, 40 15, 20 10, 10 35), (30 20, 35 35, 20 30, 30 20))');
  assert.equal(resultWithAlt, 'SRID=4326;POLYGON((10 35 20, 45 45 21, 40 15 22, 20 10 23, 10 35 20), (30 20 24, 35 35 25, 20 30 26, 30 20 24))');
});

test('test method latlngToPolygonEWKT for MultiPolygon without hole', function(assert) {
  //Arrange
  let latlng = [
    [[L.latLng(30, 20), L.latLng(45, 40), L.latLng(10, 40)]],
    [[L.latLng(15, 5), L.latLng(40, 10), L.latLng(10, 20), L.latLng(5, 10)]]
  ];
  let latlngsWithAlt = [
    [[L.latLng(30, 20, 20), L.latLng(45, 40, 21), L.latLng(10, 40, 22)]],
    [[L.latLng(15, 5, 23), L.latLng(40, 10, 24), L.latLng(10, 20, 25), L.latLng(5, 10, 26)]]
  ];

  //Act
  let result = latlngToPolygonEWKT(latlng, crs);
  let resultWithAlt = latlngToPolygonEWKT(latlngsWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;MULTIPOLYGON(((20 30, 40 45, 40 10, 20 30)), ((5 15, 10 40, 20 10, 10 5, 5 15)))');
  assert.equal(resultWithAlt, 'SRID=4326;MULTIPOLYGON(((20 30 20, 40 45 21, 40 10 22, 20 30 20)), ((5 15 23, 10 40 24, 20 10 25, 10 5 26, 5 15 23)))');
});

test('test method latlngToPolygonEWKT for MultiPolygon with hole', function(assert) {
  //Arrange
  let latlng = [
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

  //Act
  let result = latlngToPolygonEWKT(latlng, crs);
  let resultWithAlt = latlngToPolygonEWKT(latlngsWithAlt, crs);

  //Assert
  assert.equal(result, 'SRID=4326;MULTIPOLYGON(((40 40, 45 20, 30 45, 40 40)), ((35 20, 30 10, 10 10, 5 30, 20 45, 35 20), (20 30, 15 20, 25 20, 20 30)))');
  assert.equal(resultWithAlt, 'SRID=4326;MULTIPOLYGON(((40 40 20, 45 20 21, 30 45 22, 40 40 20)), ' +
    '((35 20 24, 30 10 25, 10 10 26, 5 30 27, 20 45 28, 35 20 24), (20 30 29, 15 20 30, 25 20 31, 20 30 29)))');
});
