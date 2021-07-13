import featureWithAreaIntersect, { intersectionArea } from 'ember-flexberry-gis/utils/feature-with-area-intersect';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utility | intersectionArea');

let testAObjIntersect = L.polygon([
  [125683.7646000004, 6473431.741699998],
  [125662.04439999978, 6473428.5752],
  [125644.82490000012, 6473430.114399999],
  [125683.7646000004, 6473431.741699998]]).toGeoJSON();
let testBObjIntersect = L.polygon([
  [125683.7646000002, 6473431.741699997],
  [125662.04439999979, 6473428.5751],
  [125644.82490000013, 6473430.1144],
  [125683.7646000002, 6473431.741699997]]).toGeoJSON();

let testBObjNotIntersect = L.polygon([[5, 5], [6, 7], [7, 6], [5, 5]]).toGeoJSON();
testBObjIntersect.properties = {};

test('test method intersectionArea for two polygon', function(assert) {
  assert.expect(1);

  //Act
  let res = intersectionArea(testAObjIntersect, testBObjIntersect, 10000);

  //Assert
  assert.equal(res, 43.97863930247094, 'Assert intersectArea');
});

test('test method intersectionArea for two polygon with scale 0.1', function(assert) {
  assert.expect(1);

  //Act
  let res = intersectionArea(testAObjIntersect, testBObjIntersect, 0.1);

  //Assert
  assert.equal(res, 0, 'Assert intersectArea');
});

test('test method intersectionArea for two polygon with scale 10', function(assert) {
  assert.expect(1);

  //Act
  let res = intersectionArea(testAObjIntersect, testBObjIntersect, 10);

  //Assert
  assert.equal(res, 43.010000004803295, 'Assert intersectArea');
});

test('test method intersectionArea for two polygon not intesect', function(assert) {
  assert.expect(1);

  //Act
  let res = intersectionArea(testAObjIntersect, testBObjNotIntersect, 10000);

  //Assert
  assert.equal(res, 0, 'Assert intersectArea');
});

test('test method featureWithAreaIntersect for two polygon', function(assert) {
  assert.expect(2);

  //Arrange
  let _convertObjectCoordinates = () =>  { return testBObjIntersect; };

  let mapModel = {
    _convertObjectCoordinates() { }
  };
  let stubConvertCoordinates = sinon.stub(mapModel, '_convertObjectCoordinates', _convertObjectCoordinates);
  let leafletLayer = L.polygon([[[1, 2], [3, 4], [4, 5], [1, 2]]]);
  leafletLayer.options = {
    crs: {
      code: 'EPSG:4326'
    }
  };

  //Act
  let res = featureWithAreaIntersect(testAObjIntersect, testBObjIntersect, leafletLayer, mapModel, 10000);

  //Assert
  assert.equal(res.properties.intersectionArea, 43.97863930247094, 'Assert intersectArea');
  assert.equal(stubConvertCoordinates.callCount, 0, 'Assert call count for method _convertObjectCoordinates');
});

test('test method featureWithAreaIntersect for two polygon not intersect', function(assert) {
  assert.expect(3);

  //Arrange
  let _convertObjectCoordinates = () =>  { return testBObjNotIntersect; };

  let mapModel = {
    _convertObjectCoordinates() { }
  };
  let stubConvertCoordinates = sinon.stub(mapModel, '_convertObjectCoordinates', _convertObjectCoordinates);
  let leafletLayer = L.polygon([[[1, 2], [3, 4], [4, 5], [1, 2]]]);
  leafletLayer.options = {
    crs: {
      code: 'EPSG:32640'
    }
  };

  //Act
  let res = featureWithAreaIntersect(testAObjIntersect, testBObjNotIntersect, leafletLayer, mapModel, 10000);

  //Assert
  assert.equal(res.properties.intersectionArea, 0, 'Assert intersectArea');
  assert.equal(stubConvertCoordinates.callCount, 1, 'Assert call count for method _convertObjectCoordinates');
  assert.equal(stubConvertCoordinates.args[0][0], 'EPSG:32640', 'Assert first argument on method _convertObjectCoordinates');
});
