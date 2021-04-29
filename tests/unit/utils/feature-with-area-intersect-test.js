import featureWithAreaIntersect, { intersectionArea } from 'ember-flexberry-gis/utils/feature-with-area-intersect';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utility | intersectionArea');

let testAObjIntersect = L.polygon([[1, 2], [2, 4], [5, 3], [1, 2]]).toGeoJSON();
let testBObjIntersect = L.polygon([[1, 2], [2, 4], [2, 3], [1, 2]]).toGeoJSON();

let testBObjNotIntersect = L.polygon([[5, 5], [6, 7], [7, 6], [5, 5]]).toGeoJSON();
testBObjIntersect.properties = {};

test('test method intersectionArea for two polygon', function(assert) {
  assert.expect(1);

  //Act
  let res = intersectionArea(testAObjIntersect, testBObjIntersect, 10000);

  //Assert
  assert.equal(res, 0.5, 'Assert intersectArea');
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
  assert.equal(res.properties.intersectionArea, 0.5, 'Assert intersectArea');
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
