import { resolve, Promise } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | test method _getDistanceBetweenObjects', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  test('test method getDistanceBetweenObjects between polyline and polygon', function (assert) {
    // Arrange
    assert.expect(7);
    const done = assert.async(1);
    const firstObj = L.polyline([[1.001, 1.001], [1.003, 1.003], [1.005, 1.005]]);
    firstObj.feature = firstObj.toGeoJSON();
    const secondObj = L.polygon([[1.001, 1.001], [1.001, 1.002], [1.003, 1.001], [1.003, 0]]);
    secondObj.feature = secondObj.toGeoJSON();
    const getModelLayerFeature = (layerId) => resolve([null, null, [layerId === '1' ? firstObj : secondObj]]);

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature() {},
    });
    const getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);

    // Act
    const result = subject.getDistanceBetweenObjects('1', '4', '2', '3');

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((res) => {
      assert.equal(res, 55820.041009409564, 'Equals rezult distance with test distance');
      assert.equal(getMLFeature.callCount, 2, 'Check call count to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][1], '4', 'Check call second arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[1][0], '2', 'Check call first arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[1][1], '3', 'Check call second arg to method _getModelLayerFeature');
      done();
      getMLFeature.restore();
    });
  });

  test('test method getDistanceBetweenObjects between marker and polygon', function (assert) {
    // Arrange
    assert.expect(7);
    const done = assert.async(1);
    const firstObj = L.marker([1.001, 1.001]);
    firstObj.feature = firstObj.toGeoJSON();
    const secondObj = L.polygon([[1.001, 1.001], [1.001, 1.002], [1.003, 1.001], [1.003, 0]]);
    secondObj.feature = secondObj.toGeoJSON();
    const getModelLayerFeature = (layerId) => resolve([null, null, [layerId === '1' ? firstObj : secondObj]]);

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature() {},
    });
    const getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);

    // Act
    const result = subject.getDistanceBetweenObjects('1', '4', '2', '3');

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((res) => {
      assert.equal(res, 55597.65129192688, 'Equals rezult distance with test distance');
      assert.equal(getMLFeature.callCount, 2, 'Check call count to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][1], '4', 'Check call second arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[1][0], '2', 'Check call first arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[1][1], '3', 'Check call second arg to method _getModelLayerFeature');
      done();
      getMLFeature.restore();
    });
  });

  test('test method getDistanceBetweenObjects between marker and marker', function (assert) {
    // Arrange
    assert.expect(7);
    const done = assert.async(1);
    const firstObj = L.marker([1.001, 1.001]);
    firstObj.feature = firstObj.toGeoJSON();
    const secondObj = L.marker([1.001, 1.002]);
    secondObj.feature = secondObj.toGeoJSON();
    const getModelLayerFeature = (layerId) => resolve([null, null, [layerId === '1' ? firstObj : secondObj]]);

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature() {},
    });
    const getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);

    // Act
    const result = subject.getDistanceBetweenObjects('1', '4', '2', '3');

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((res) => {
      assert.equal(res, 111.19508023354534);
      assert.equal(getMLFeature.callCount, 2, 'Check call count to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][1], '4', 'Check call second arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[1][0], '2', 'Check call first arg to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[1][1], '3', 'Check call second arg to method _getModelLayerFeature');
      done();
      getMLFeature.restore();
    });
  });
});
