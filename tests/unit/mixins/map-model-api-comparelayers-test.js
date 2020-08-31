import Ember from 'ember';
import FlexberryMapModelApiMixin  from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import { module, test } from 'qunit';
import ClipperLib from 'npm:clipper-lib';

module('Unit | Mixin | map model api comparelayers');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let feature1 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[[3, 3], [3, 7], [8, 7], [8, 3], [3, 3]]]]
};

let feature2 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[[6, 5], [6, 9], [10, 9], [10, 5], [6, 5]]]]
};

let feature3 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[[4, 4], [4, 5], [5, 5], [5, 4], [4, 4]]]]
};

let feature4 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[[10, 3], [9, 3], [9, 2], [10, 2], [10, 3]]]]
};

let crsFactory32640 = {
  code: 'EPSG:32640',
  definition: '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs',
  create() {
    let crs = L.extend({}, new L.Proj.CRS(this.code, this.definition), {
      scale: function (zoom) {
        return 256 * Math.pow(2, zoom);
      },
      zoom: function (scale) {
        return Math.log(scale / 256) / Math.LN2;
      }
    });
    return crs;
  }
};
let crs32640 = crsFactory32640.create();

let geoJson32640 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[
    [514059.321485393, 6507392.17766284], [513865.509562311, 6507418.6567982],
    [513839.790201802, 6507279.05179395], [514059.321485393, 6507392.17766284]
  ]]]
};

test('_coordsToPoints should return array of points to the power of 8', function(assert) {
  assert.expect(1);

  let featureLayer = L.geoJSON(geoJson32640).getLayers()[0].getLatLngs();

  let subject = mapApiMixinObject.create();
  let result = subject._coordsToPoints(featureLayer);

  assert.deepEqual(result, [[[
    { 'X': 51405932148539, 'Y': 650739217766284 }, { 'X': 51386550956231, 'Y': 650741865679820 },
    { 'X': 51383979020180, 'Y': 650727905179395 }
  ]]]);
});

test('_pointsToCoords should return array of coordinates', function(assert) {
  assert.expect(1);

  let arr =  [[[
    new ClipperLib.IntPoint(51405932148539, 650739217766284), new ClipperLib.IntPoint(51386550956231, 650741865679820),
    new ClipperLib.IntPoint(51383979020180, 650727905179395)
  ]]];

  let subject = mapApiMixinObject.create();
  let result = subject._pointsToCoords(arr);

  assert.deepEqual(result, [[[
    [514059.32148539, 6507392.17766284], [513865.50956231, 6507418.65679820],
    [513839.79020180, 6507279.05179395], [514059.32148539, 6507392.17766284]
  ]]]);
});

test('_addToArrayPointsAndFeature should return points and features', function(assert) {
  assert.expect(2);
  let done = assert.async(1);

  let featureLayer = L.geoJSON(geoJson32640).getLayers()[0];
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {
      return Ember.RSVP.resolve(
        new Ember.RSVP.resolve([
          null,
          { options: { crs: crs32640 } },
          [featureLayer]])
      );
    }
  });

  let result = subject._addToArrayPointsAndFeature();

  result.then((arrayPointsAndFeature) => {
    assert.deepEqual(arrayPointsAndFeature.arrPoints[0],
      [[[
        { 'X': 51405932148539, 'Y': 650739217766284 }, { 'X': 51386550956231, 'Y': 650741865679820 },
        { 'X': 51383979020180, 'Y': 650727905179395 }
      ]]]
    );
    assert.ok(arrayPointsAndFeature.features[0]);
    done();
  });
});

test('differenceLayers should return the difference of layers', function(assert) {
  assert.expect(4);
  let done = assert.async(1);

  let featureLayer1 = L.geoJSON(feature1).getLayers()[0];
  let featureLayer2 = L.geoJSON(feature2).getLayers()[0];

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layer) {
      if (layer === '1') {
        return Ember.RSVP.resolve(
          new Ember.RSVP.resolve([
            null,
            { options: { crs: crs32640 } },
            [featureLayer1]])
        );
      } else {
        return Ember.RSVP.resolve(
          new Ember.RSVP.resolve([
            null,
            { options: { crs: crs32640 } },
            [featureLayer2]])
        );
      }
    },
    _getModelLeafletObject() {
      return [
        null,
        { options: { crs: crs32640 } },
      ];
    }
  });

  let result = subject.differenceLayers('1', '2');

  result.then((diff) => {
    assert.deepEqual(diff.diffFeatures[0].feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[8, 5], [6, 5], [6, 7], [3, 7], [3, 3], [8, 3], [8, 5]]],
        }
      }
    );
    assert.equal(diff.diffFeatures[0].area.toFixed(2), 16.00);
    assert.ok(diff.layerA);
    assert.ok(diff.layerB);
    done();
  });
});

test('differenceLayers should return NOT difference', function(assert) {
  assert.expect(1);
  let done = assert.async(1);

  let featureLayer1 = L.geoJSON(feature1).getLayers()[0];

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layer) {
      if (layer === '1') {
        return Ember.RSVP.resolve(
          new Ember.RSVP.resolve([
            null,
            { options: { crs: crs32640 } },
            [featureLayer1]])
        );
      } else {
        return Ember.RSVP.resolve(
          new Ember.RSVP.resolve([
            null,
            { options: { crs: crs32640 } },
            [featureLayer1]])
        );
      }
    },
    _getModelLeafletObject() {
      return [
        null,
        { options: { crs: crs32640 } },
      ];
    }
  });

  let result = subject.differenceLayers('1', '2');

  result.then((diff) => {
    assert.equal(diff, 'The difference is not found');
    done();
  });
});

test('compareLayers should return array of objects', function(assert) {
  assert.expect(22);
  let done = assert.async(4);

  let featureLayer1 = L.geoJSON(feature1).getLayers()[0];
  featureLayer1.options.crs = crs32640;
  featureLayer1.feature.properties.primarykey = '001';
  let featureLayer3 = L.geoJSON(feature3).getLayers()[0];
  featureLayer3.options.crs = crs32640;
  featureLayer3.feature.properties.primarykey = '003';
  let featureLayer4 = L.geoJSON(feature4).getLayers()[0];
  featureLayer4.options.crs = crs32640;
  featureLayer4.feature.properties.primarykey = '004';

  let featureLayer2 = L.geoJSON(feature2).getLayers()[0];
  featureLayer2.options.crs = crs32640;
  featureLayer2.feature.properties.primarykey = '002';

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layer) {
      if (layer === '1') {
        return Ember.RSVP.resolve(
          new Ember.RSVP.resolve([
            null,
            { options: { crs: crs32640 } },
            [featureLayer1]])
        );
      } else if ('2') {
        return Ember.RSVP.resolve(
          new Ember.RSVP.resolve([
            null,
            { options: { crs: crs32640 } },
            [featureLayer2, featureLayer3, featureLayer4]])
        );
      }
    },
    _getModelLeafletObject() {
      return [
        null,
        { options: { crs: crs32640 } },
      ];
    }
  });

  let resIntersects = subject.compareLayers('1', '2', 'intersects', false);
  let resContains = subject.compareLayers('1', '2', 'contains', false);
  let resNotIntersects = subject.compareLayers('1', '2', 'notIntersects', false);
  let resNotDiff = subject.compareLayers('1', '1', 'intersects', false);

  resIntersects.then((result) => {
    assert.equal(result.length, 2);
    assert.deepEqual(result[0].objectDifference.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[8, 5], [6, 5], [6, 7], [3, 7], [3, 3], [8, 3], [8, 5]]],
        }
      }
    );
    assert.equal(result[0].areaDifference.toFixed(2), 16.00);
    assert.equal(result[0].id, '002');

    assert.deepEqual(result[1].objectDifference.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[4, 4], [4, 5], [5, 5], [5, 4], [4, 4]]],
        }
      }
    );
    assert.equal(result[1].areaDifference.toFixed(2), 1.00);
    assert.equal(result[1].hasOwnProperty('id'), false);
    done();
  });

  resContains.then((result) => {
    assert.equal(result.length, 2);
    assert.deepEqual(result[0].objectDifference.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[8, 5], [6, 5], [6, 7], [3, 7], [3, 3], [8, 3], [8, 5]]],
        }
      }
    );
    assert.equal(result[0].areaDifference.toFixed(2), 16.00);
    assert.equal(result[0].hasOwnProperty('id'), false);

    assert.deepEqual(result[1].objectDifference.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[4, 4], [4, 5], [5, 5], [5, 4], [4, 4]]],
        }
      }
    );
    assert.equal(result[1].areaDifference.toFixed(2), 1.00);
    assert.equal(result[1].id, '003');
    done();
  });

  resNotIntersects.then((result) => {
    assert.equal(result.length, 2);
    assert.deepEqual(result[0].objectDifference.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[10, 9], [6, 9], [6, 7], [8, 7], [8, 5], [10, 5], [10, 9]]],
        }
      }
    );
    assert.equal(result[0].areaDifference.toFixed(2), 12.00);
    assert.equal(result[0].id, '002');

    assert.deepEqual(result[1].objectDifference.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[10, 3], [9, 3], [9, 2], [10, 2], [10, 3]]],
        }
      }
    );
    assert.equal(result[1].areaDifference.toFixed(2), 1.00);
    assert.equal(result[1].id, '004');
    done();
  });

  resNotDiff.catch((result) => {
    assert.equal(result, 'The difference is not found');
    done();
  });
});
