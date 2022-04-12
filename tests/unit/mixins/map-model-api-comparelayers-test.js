import { resolve } from 'rsvp';
import EmberObject from '@ember/object';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import { module, test } from 'qunit';
import ClipperLib from 'npm:clipper-lib';

module('Unit | Mixin | map model api comparelayers', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  const feature1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[[3, 3], [3, 7], [8, 7], [8, 3], [3, 3]]]],
  };

  const feature2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[[6, 5], [6, 9], [10, 9], [10, 5], [6, 5]]]],
  };

  const feature3 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[[4, 4], [4, 5], [5, 5], [5, 4], [4, 4]]]],
  };

  const feature4 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[[10, 3], [9, 3], [9, 2], [10, 2], [10, 3]]]],
  };

  const crsFactory32640 = {
    code: 'EPSG:32640',
    definition: '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs',
    create() {
      const crs = L.extend({}, new L.Proj.CRS(this.code, this.definition), {
        scale(zoom) {
          return 256 * (2 ** zoom);
        },
        zoom(scale) {
          return Math.log(scale / 256) / Math.LN2;
        },
      });
      return crs;
    },
  };
  const crs32640 = crsFactory32640.create();

  const geoJson32640 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [514059.321485393, 6507392.17766284], [513865.509562311, 6507418.6567982],
      [513839.790201802, 6507279.05179395], [514059.321485393, 6507392.17766284]
    ]]],
  };

  test('_coordsToPoints should return array of points to the power of 8', function (assert) {
    assert.expect(1);

    const featureLayer = L.geoJSON(geoJson32640).getLayers()[0].getLatLngs();

    const subject = mapApiMixinObject.create();
    const result = subject._coordsToPoints(featureLayer);

    assert.deepEqual(result, [[[
      { X: 51405932148539, Y: 650739217766284, }, { X: 51386550956231, Y: 650741865679820, },
      { X: 51383979020180, Y: 650727905179395, }
    ]]]);
  });

  test('_pointsToCoords should return array of coordinates', function (assert) {
    assert.expect(1);

    const arr = [[[
      new ClipperLib.IntPoint(51405932148539, 650739217766284), new ClipperLib.IntPoint(51386550956231, 650741865679820),
      new ClipperLib.IntPoint(51383979020180, 650727905179395)
    ]]];

    const subject = mapApiMixinObject.create();
    const result = subject._pointsToCoords(arr);

    assert.deepEqual(result, [[[
      [514059.32148539, 6507392.17766284], [513865.50956231, 6507418.65679820],
      [513839.79020180, 6507279.05179395], [514059.32148539, 6507392.17766284]
    ]]]);
  });

  test('_addToArrayPointsAndFeature should return points and features', function (assert) {
    assert.expect(2);
    const done = assert.async(1);

    const featureLayer = L.geoJSON(geoJson32640).getLayers()[0];
    const subject = mapApiMixinObject.create({
      _getModelLayerFeature() {
        return resolve(
          /* eslint-disable-next-line new-cap */
          new resolve([
            null,
            { options: { crs: crs32640, }, },
            [featureLayer]])
        );
      },
    });

    const result = subject._addToArrayPointsAndFeature();

    result.then((arrayPointsAndFeature) => {
      assert.deepEqual(arrayPointsAndFeature.arrPoints[0],
        [[[
          { X: 51405932148539, Y: 650739217766284, }, { X: 51386550956231, Y: 650741865679820, },
          { X: 51383979020180, Y: 650727905179395, }
        ]]]);
      assert.ok(arrayPointsAndFeature.features[0]);
      done();
    });
  });

  test('differenceLayers should return the difference of layers', function (assert) {
    assert.expect(4);
    const done = assert.async(1);

    const featureLayer1 = L.geoJSON(feature1).getLayers()[0];
    const featureLayer2 = L.geoJSON(feature2).getLayers()[0];

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature(layer) {
        if (layer === '1') {
          return resolve(
            /* eslint-disable-next-line new-cap */
            new resolve([
              null,
              { options: { crs: crs32640, }, },
              [featureLayer1]])
          );
        }

        return resolve(
          /* eslint-disable-next-line new-cap */
          new resolve([
            null,
            { options: { crs: crs32640, }, },
            [featureLayer2]])
        );
      },
      _getModelLeafletObject() {
        return [
          null,
          { options: { crs: crs32640, }, }
        ];
      },
    });

    const result = subject.differenceLayers('1', '2');

    result.then((diff) => {
      assert.deepEqual(diff.diffFeatures[0].feature,
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[8, 5], [6, 5], [6, 7], [3, 7], [3, 3], [8, 3], [8, 5]]],
          },
        });
      assert.equal(diff.diffFeatures[0].area.toFixed(2), 16.00);
      assert.ok(diff.layerA);
      assert.ok(diff.layerB);
      done();
    });
  });

  test('differenceLayers should return NOT difference', function (assert) {
    assert.expect(1);
    const done = assert.async(1);

    const featureLayer1 = L.geoJSON(feature1).getLayers()[0];

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature(layer) {
        if (layer === '1') {
          return resolve(
            /* eslint-disable-next-line new-cap */
            new resolve([
              null,
              { options: { crs: crs32640, }, },
              [featureLayer1]])
          );
        }

        return resolve(
          /* eslint-disable-next-line new-cap */
          new resolve([
            null,
            { options: { crs: crs32640, }, },
            [featureLayer1]])
        );
      },
      _getModelLeafletObject() {
        return [
          null,
          { options: { crs: crs32640, }, }
        ];
      },
    });

    const result = subject.differenceLayers('1', '2');

    result.then((diff) => {
      assert.equal(diff, 'The difference is not found');
      done();
    });
  });

  test('compareLayers should return array of objects', function (assert) {
    assert.expect(22);
    const done = assert.async(4);

    const featureLayer1 = L.geoJSON(feature1).getLayers()[0];
    featureLayer1.options.crs = crs32640;
    featureLayer1.feature.properties.primarykey = '001';
    const featureLayer3 = L.geoJSON(feature3).getLayers()[0];
    featureLayer3.options.crs = crs32640;
    featureLayer3.feature.properties.primarykey = '003';
    const featureLayer4 = L.geoJSON(feature4).getLayers()[0];
    featureLayer4.options.crs = crs32640;
    featureLayer4.feature.properties.primarykey = '004';

    const featureLayer2 = L.geoJSON(feature2).getLayers()[0];
    featureLayer2.options.crs = crs32640;
    featureLayer2.feature.properties.primarykey = '002';

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature(layer) {
        if (layer === '1') {
          return resolve(
            /* eslint-disable-next-line new-cap */
            new resolve([
              null,
              { options: { crs: crs32640, }, },
              [featureLayer1]])
          );
        }

        if (layer === '2') {
          return resolve(
            /* eslint-disable-next-line new-cap */
            new resolve([
              null,
              { options: { crs: crs32640, }, },
              [featureLayer2, featureLayer3, featureLayer4]])
          );
        }
      },
      _getModelLeafletObject() {
        return [
          null,
          { options: { crs: crs32640, }, }
        ];
      },
    });

    const resIntersects = subject.compareLayers('1', '2', 'intersects', false);
    const resContains = subject.compareLayers('1', '2', 'contains', false);
    const resNotIntersects = subject.compareLayers('1', '2', 'notIntersects', false);
    const resNotDiff = subject.compareLayers('1', '1', 'intersects', false);

    resIntersects.then((result) => {
      assert.equal(result.length, 2);
      assert.deepEqual(result[0].objectDifference.feature,
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[8, 5], [6, 5], [6, 7], [3, 7], [3, 3], [8, 3], [8, 5]]],
          },
        });
      assert.equal(result[0].areaDifference.toFixed(2), 16.00);
      assert.equal(result[0].id, '002');

      assert.deepEqual(result[1].objectDifference.feature,
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[4, 4], [4, 5], [5, 5], [5, 4], [4, 4]]],
          },
        });
      assert.equal(result[1].areaDifference.toFixed(2), 1.00);
      assert.equal(Object.prototype.hasOwnProperty.call(result[1], 'id'), false);
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
          },
        });
      assert.equal(result[0].areaDifference.toFixed(2), 16.00);
      assert.equal(Object.prototype.hasOwnProperty.call(result[0], 'id'), false);

      assert.deepEqual(result[1].objectDifference.feature,
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[4, 4], [4, 5], [5, 5], [5, 4], [4, 4]]],
          },
        });
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
          },
        });
      assert.equal(result[0].areaDifference.toFixed(2), 12.00);
      assert.equal(result[0].id, '002');

      assert.deepEqual(result[1].objectDifference.feature,
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[10, 3], [9, 3], [9, 2], [10, 2], [10, 3]]],
          },
        });
      assert.equal(result[1].areaDifference.toFixed(2), 1.00);
      assert.equal(result[1].id, '004');
      done();
    });

    resNotDiff.catch((result) => {
      assert.equal(result, 'The difference is not found');
      done();
    });
  });
});
