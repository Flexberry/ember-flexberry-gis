import { coordinatesToString, coordinatesToArray } from 'ember-flexberry-gis/utils/coordinates-to';
import { module, test } from 'qunit';

module('Unit | Utility | coordinates to');

test('test methods coordinatesToString and coordinatesToArray for Point', function(assert) {
  let feature = {
    type: 'Point',
    coordinates: [10, 30]
  };

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '10 30 \n');
  assert.deepEqual(resultArray, [[10, 30]]);
});

test('test method coordinatesToString for LineString', function(assert) {
  let feature = {
    type: 'LineString',
    coordinates: [[10, 30], [30, 10], [40, 40]]
  };

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '10 30 \n30 10 \n40 40 \n');
  assert.deepEqual(resultArray, [[10, 30], [30, 10], [40, 40]]);
});

test('test method coordinatesToString and coordinatesToArray for MultiLineString', function(assert) {
  let feature = {
    type: 'MultiLineString',
    coordinates: [
      [[10, 10], [20, 20], [40, 10]],
      [[40, 40], [30, 30], [20, 40]]
    ]
  };

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '10 10 \n20 20 \n40 10 \n\n40 40 \n30 30 \n20 40 \n');
  assert.deepEqual(resultArray, [[10, 10], [20, 20], [40, 10], null, [40, 40], [30, 30], [20, 40]]);
});

test('test method coordinatesToString and coordinatesToArray for Polygon without hole', function(assert) {
  let feature = {
    type: 'Polygon',
    coordinates: [
      [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
    ]
  };

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '10 30 \n40 40 \n40 20 \n20 10 \n10 30 \n');
  assert.deepEqual(resultArray, [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]);
});

test('test method coordinatesToString and coordinatesToArray for Polygon with hole', function(assert) {
  let feature = {
    type: 'Polygon',
    coordinates: [
      [[10, 35], [45, 45], [40, 15], [20, 10], [10, 35]],
      [[30, 20], [35, 35], [20, 30], [30, 20]]
    ]
  };

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '10 35 \n45 45 \n40 15 \n20 10 \n10 35 \n\n30 20 \n35 35 \n20 30 \n30 20 \n');
  assert.deepEqual(resultArray, [[10, 35], [45, 45], [40, 15], [20, 10], [10, 35], null, [30, 20], [35, 35], [20, 30], [30, 20]]);
});

test('test method coordinatesToString and coordinatesToArray for MultiPolygon without hole', function(assert) {
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

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '20 30 \n40 45 \n40 10 \n20 30 \n\n5 15 \n10 40 \n20 10 \n10 5 \n5 15 \n');
  assert.deepEqual(resultArray, [[20, 30], [40, 45], [40, 10], [20, 30], null, [5, 15], [10, 40], [20, 10], [10, 5], [5, 15]]);
});

test('test method coordinatesToString and coordinatesToArray for MultiPolygon with hole', function(assert) {
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

  let resultString = coordinatesToString(feature.coordinates);
  let resultArray = coordinatesToArray(feature.coordinates);
  assert.equal(resultString, '40 40 \n45 20 \n30 45 \n40 40 \n\n35 20 \n30 10 \n10 10 \n5 30 \n20 45 \n35 20 \n20 30 \n15 20 \n25 20 \n20 30 \n');
  assert.deepEqual(resultArray, [[40, 40], [45, 20], [30, 45], [40, 40], null, [35, 20], [30, 10],
    [10, 10], [5, 30], [20, 45], [35, 20], [20, 30], [15, 20], [25, 20], [20, 30]]);
});
