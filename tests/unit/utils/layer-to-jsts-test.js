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

test('test method latlngToPointJsts and geometryToJsts for Point', function(assert) {
  //Arrange
  let latlng = L.latLng(30.2412455, 10.0293053246);
  let feature = {
    type: 'Point',
    coordinates: [10.0293053246, 30.2412455]
  };

  //Act
  let resultToJsts = latlngToPointJsts(latlng, crs, false, 10000);
  let resultFromGeoJSON = geometryToJsts(feature, 10000);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getCoordinate().toString(), '(10.0293, 30.2412, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'Point');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getCoordinate().toString(), '(10.0293, 30.2412, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'Point');
});

test('test method latlngToPolylineJsts and geometryToJsts for LineString', function(assert) {
  //Arrange
  let latlngs = [L.latLng(30.2412455, 10.0293053246), L.latLng(10.34325346, 30.43653456), L.latLng(40.45644567, 40.2356236)];
  let feature = {
    type: 'LineString',
    coordinates: [[10.0293053246, 30.2412455], [30.43653456, 10.34325346], [40.2356236, 40.45644567]]
  };

  //Act
  let resultToJsts = latlngToPolylineJsts(latlngs, crs, false, 10000);
  let resultFromGeoJSON = geometryToJsts(feature, 10000);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 1);
  assert.equal(resultToJsts.getCoordinates().toString(), '(10.0293, 30.2412, undefined),(30.4365, 10.3433, undefined),' +
  '(40.2356, 40.4564, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'LineString');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 1);
  assert.equal(resultFromGeoJSON.getCoordinates().toString(), '(10.0293, 30.2412, undefined),(30.4365, 10.3433, undefined),' +
  '(40.2356, 40.4564, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'LineString');
});

test('test method latlngToPolygonJsts and geometryToJsts with geometry reducer', function(assert) {
  //Arrange
  let latlngs = [
    [[L.latLng(40.236234235, 40.252152235), L.latLng(20.23423647, 45.352367), L.latLng(45.347643587, 30.346347)]],
    [[L.latLng(20.02002360, 35.0002306), L.latLng(10.00023623, 30.345236), L.latLng(10.904986764, 10.23623478),
      L.latLng(30.4584699, 5.47457568), L.latLng(45.569569596, 20.569856709)]]
  ];
  let feature = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [[40.252152235, 40.236234235], [45.352367, 20.23423647],
        [30.346347, 45.347643587], [40.252152235, 40.236234235]]
      ],
      [
        [[35.0002306, 20.02002360], [30.345236, 10.00023623], [10.23623478, 10.904986764],
        [5.47457568, 30.4584699], [20.569856709, 45.569569596], [35.0002306, 20.02002360]]
      ]
    ]
  };

  //Act
  let resultToJsts = latlngToPolygonJsts(latlngs, crs, false, 10000);
  let resultFromGeoJSON = geometryToJsts(feature, 10000);

  //Assert
  assert.equal(resultToJsts.getNumGeometries(), 2);
  assert.equal(resultToJsts.getGeometryN(0).getCoordinates().toString(), '(40.2522, 40.2362, undefined),(45.3524, 20.2342, undefined),' +
  '(30.3463, 45.3476, undefined),(40.2522, 40.2362, undefined)');
  assert.equal(resultToJsts.getGeometryN(1).getCoordinates().toString(), '(35.0002, 20.02, undefined)' +
  ',(30.3452, 10.0002, undefined),(10.2362, 10.905, undefined),' +
  '(5.4746, 30.4585, undefined),(20.5699, 45.5696, undefined),(35.0002, 20.02, undefined)');
  assert.equal(resultToJsts.getGeometryType(), 'MultiPolygon');
  assert.equal(resultFromGeoJSON.getNumGeometries(), 2);
  assert.equal(resultFromGeoJSON.getGeometryN(0).getCoordinates().toString(), '(40.2522, 40.2362, undefined),(45.3524, 20.2342, undefined),' +
    '(30.3463, 45.3476, undefined),(40.2522, 40.2362, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryN(1).getExteriorRing().getCoordinates().toString(), '(35.0002, 20.02, undefined),' +
    '(30.3452, 10.0002, undefined),(10.2362, 10.905, undefined),' +
    '(5.4746, 30.4585, undefined),(20.5699, 45.5696, undefined),(35.0002, 20.02, undefined)');
  assert.equal(resultFromGeoJSON.getGeometryType(), 'MultiPolygon');
});
