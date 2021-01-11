import { latlngToPointJsts, latlngToPolylineJsts, latlngToPolygonJsts, geometryToJsts } from 'ember-flexberry-gis/utils/layer-to-jsts';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { module, test } from 'qunit';

module('Unit | Utility | layer to jsts');

let crs = crsFactory4326.create();

test('test method latlngToPointJsts and geometryToJsts for Point', function(assert) {
  //Arrange
  let latlng = L.latLng(30, 10);
  let feature = {
    type: 'Point',
    coordinates: [10, 30]
  };

  //Act
  let resultToJsts = latlngToPointJsts(latlng, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getCoordinate().toString(), '(10, 30, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'Point');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getCoordinate().toString(), '(10, 30, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'Point');
});

test('test method latlngToPointJsts and geometryToJsts for Point with altitude', function(assert) {
  //Arrange
  let latlng = L.latLng(30, 10, 20);
  let feature = {
    type: 'Point',
    coordinates: [10, 30, 20]
  };

  //Act
  let resultToJsts = latlngToPointJsts(latlng, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getCoordinate().toString(), '(10, 30, 20)');
  assert.equal(resultToJsts.getGeometryType(), 'Point');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getCoordinate().toString(), '(10, 30, 20)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'Point');
});

test('test method latlngToPolylineJsts and geometryToJsts for LineString', function(assert) {
  //Arrange
  let latlngs = [L.latLng(30, 10), L.latLng(10, 30), L.latLng(40, 40)];
  let feature = {
    type: 'LineString',
    coordinates: [[10, 30], [30, 10], [40, 40]]
  };

  //Act
  let resultToJsts = latlngToPolylineJsts(latlngs, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getCoordinates().toString(), '(10, 30, undefined),(30, 10, undefined),(40, 40, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'LineString');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getCoordinates().toString(), '(10, 30, undefined),(30, 10, undefined),(40, 40, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'LineString');
});

test('test method latlngToPolylineJsts and geometryToJsts for MultiLineString', function(assert) {
  //Arrange
  let latlngs = [
    [L.latLng(10, 10), L.latLng(20, 20), L.latLng(10, 40)],
    [L.latLng(40, 40), L.latLng(30, 30), L.latLng(40, 20)]
  ];
  let feature = {
    type: 'MultiLineString',
    coordinates: [
      [[10, 10], [20, 20], [40, 10]],
      [[40, 40], [30, 30], [20, 40]]
    ]
  };

  //Act
  let resultToJsts = latlngToPolylineJsts(latlngs, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 2);
  assert.equal(resultToJsts.getGeometryN(0).getCoordinates().toString(), '(10, 10, undefined),(20, 20, undefined),(40, 10, undefined)');
  assert.equal(resultToJsts.getGeometryN(1).getCoordinates().toString(), '(40, 40, undefined),(30, 30, undefined),(20, 40, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'MultiLineString');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 2);
  assert.equal(resultFromGeoJSON.getGeometryN(0).getCoordinates().toString(), '(10, 10, undefined),(20, 20, undefined),(40, 10, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryN(1).getCoordinates().toString(), '(40, 40, undefined),(30, 30, undefined),(20, 40, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'MultiLineString');
});

test('test method latlngToPolygonJsts and geometryToJsts for Polygon without hole', function(assert) {
  //Arrange
  let latlngs = [
    [L.latLng(30, 10), L.latLng(40, 40), L.latLng(20, 40), L.latLng(10, 20)]
  ];
  let feature = {
    type: 'Polygon',
    coordinates: [
      [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
    ]
  };

  //Act
  let resultToJsts = latlngToPolygonJsts(latlngs, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getGeometryN(0).getCoordinates().toString(), '(10, 30, undefined),(40, 40, undefined),(40, 20, undefined)' +
    ',(20, 10, undefined),(10, 30, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'Polygon');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getGeometryN(0).getCoordinates().toString(), '(10, 30, undefined),(40, 40, undefined),(40, 20, undefined)' +
    ',(20, 10, undefined),(10, 30, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'Polygon');
});

test('test method latlngToPolygonJsts and geometryToJsts for Polygon with hole', function(assert) {
  //Arrange
  let latlngs = [
    [L.latLng(35, 10), L.latLng(45, 45), L.latLng(15, 40), L.latLng(10, 20)],
    [L.latLng(20, 30), L.latLng(35, 35), L.latLng(30, 20)]
  ];
  let feature = {
    type: 'Polygon',
    coordinates: [
      [[10, 35], [45, 45], [40, 15], [20, 10], [10, 35]],
      [[30, 20], [35, 35], [20, 30], [30, 20]]
    ]
  };

  //Act
  let resultToJsts = latlngToPolygonJsts(latlngs, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getExteriorRing().getCoordinates().toString(), '(10, 35, undefined),(45, 45, undefined),(40, 15, undefined)' +
    ',(20, 10, undefined),(10, 35, undefined)');
  assert.equal(resultToJsts.getInteriorRingN(0).getCoordinates().toString(), '(30, 20, undefined),(35, 35, undefined),(20, 30, undefined),' +
    '(30, 20, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'Polygon');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getExteriorRing().getCoordinates().toString(), '(10, 35, undefined),(45, 45, undefined),(40, 15, undefined)' +
    ',(20, 10, undefined),(10, 35, undefined)');
  assert.equal(resultFromGeoJSON.getInteriorRingN(0).getCoordinates().toString(), '(30, 20, undefined),(35, 35, undefined),(20, 30, undefined),' +
    '(30, 20, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'Polygon');
});

test('test method latlngToPolygonJsts and geometryToJsts for MultiPolygon without hole', function(assert) {
  //Arrange
  let latlngs = [
    [[L.latLng(30, 20), L.latLng(45, 40), L.latLng(10, 40)]],
    [[L.latLng(15, 5), L.latLng(40, 10), L.latLng(10, 20), L.latLng(5, 10)]]
  ];
  let feature = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [[20, 30], [40, 45], [40, 10], [20, 30]]
      ],
      [
        [[5, 15], [10, 40], [20, 10], [10, 5], [5, 15]]
      ]
    ]
  };

  //Act
  let resultToJsts = latlngToPolygonJsts(latlngs, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 2);
  assert.equal(resultToJsts.getGeometryN(0).getCoordinates().toString(), '(20, 30, undefined),(40, 45, undefined),(40, 10, undefined),(20, 30, undefined)');
  assert.equal(resultToJsts.getGeometryN(1).getCoordinates().toString(), '(5, 15, undefined),(10, 40, undefined),(20, 10, undefined),(10, 5, undefined)' +
    ',(5, 15, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'MultiPolygon');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 2);
  assert.equal(resultFromGeoJSON.getGeometryN(0).getCoordinates().toString(), '(20, 30, undefined),(40, 45, undefined),(40, 10, undefined),' +
    '(20, 30, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryN(1).getCoordinates().toString(), '(5, 15, undefined),(10, 40, undefined),(20, 10, undefined),(10, 5, undefined)' +
    ',(5, 15, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'MultiPolygon');
});

test('test method latlngToPolygonJsts and geometryToJsts for MultiPolygon with hole', function(assert) {
  //Arrange
  let latlngs = [
    [[L.latLng(40, 40), L.latLng(20, 45), L.latLng(45, 30)]],
    [
      [L.latLng(20, 35), L.latLng(10, 30), L.latLng(10, 10), L.latLng(30, 5), L.latLng(45, 20)],
      [L.latLng(30, 20), L.latLng(20, 15), L.latLng(20, 25)]
    ]
  ];
  let feature = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [[40, 40], [45, 20], [30, 45], [40, 40]]
      ],
      [
        [[35, 20], [30, 10], [10, 10], [5, 30], [20, 45], [35, 20]],
        [[20, 30], [15, 20], [25, 20], [20, 30]]
      ]
    ]
  };

  //Act
  let resultToJsts = latlngToPolygonJsts(latlngs, crs);
  let resultFromGeoJSON = geometryToJsts(feature);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 2);
  assert.equal(resultToJsts.getGeometryN(0).getCoordinates().toString(), '(40, 40, undefined),(45, 20, undefined),(30, 45, undefined),(40, 40, undefined)');
  assert.equal(resultToJsts.getGeometryN(1).getExteriorRing().getCoordinates().toString(), '(35, 20, undefined),(30, 10, undefined),(10, 10, undefined)' +
    ',(5, 30, undefined),(20, 45, undefined),(35, 20, undefined)');
  assert.equal(resultToJsts.getGeometryN(1).getInteriorRingN(0).getCoordinates().toString(), '(20, 30, undefined),(15, 20, undefined),(25, 20, undefined),' +
    '(20, 30, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'MultiPolygon');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 2);
  assert.equal(resultFromGeoJSON.getGeometryN(0).getCoordinates().toString(), '(40, 40, undefined),(45, 20, undefined),(30, 45, undefined),' +
    '(40, 40, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryN(1).getExteriorRing().getCoordinates().toString(), '(35, 20, undefined),(30, 10, undefined),(10, 10, undefined)' +
    ',(5, 30, undefined),(20, 45, undefined),(35, 20, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryN(1).getInteriorRingN(0).getCoordinates().toString(), '(20, 30, undefined),(15, 20, undefined),' +
    '(25, 20, undefined),(20, 30, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'MultiPolygon');
});
