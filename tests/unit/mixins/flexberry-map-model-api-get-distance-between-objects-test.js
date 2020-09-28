import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | test method _getDistanceBetweenObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method _getDistanceBetweenObjects between polyline and polygon', function(assert) {
  //Arrange
  assert.expect(1);
  let firstObj = L.polyline([[1.001, 1.001], [1.003, 1.003], [1.005, 1.005]]);
  firstObj.feature = firstObj.toGeoJSON();
  let secondObj = L.polygon([[1.001, 1.001], [1.001, 1.002], [1.003, 1.001], [1.003, 0]]);
  secondObj.feature = secondObj.toGeoJSON();
  let subject = mapApiMixinObject.create();

  //Act
  let result = subject._getDistanceBetweenObjects(firstObj, secondObj);

  //Assert
  assert.equal(result, 55820.041009409564, 'Equals rezult distance with test distance');
});

test('test method _getDistanceBetweenObjects between marker and polygon', function(assert) {
  //Arrange
  assert.expect(1);
  let firstObj = L.marker([1.001, 1.001]);
  firstObj.feature = firstObj.toGeoJSON();
  let secondObj = L.polygon([[1.001, 1.001], [1.001, 1.002], [1.003, 1.001], [1.003, 0]]);
  secondObj.feature = secondObj.toGeoJSON();
  let subject = mapApiMixinObject.create();

  //Act
  let result = subject._getDistanceBetweenObjects(firstObj, secondObj);

  //Assert
  assert.equal(result, 55597.65129192688, 'Equals rezult distance with test distance');
});

test('test method _getDistanceBetweenObjects between marker and marker', function(assert) {
  //Arrange
  assert.expect(1);
  let firstObj = L.marker([1.001, 1.001]);
  firstObj.feature = firstObj.toGeoJSON();
  let secondObj = L.marker([1.001, 1.002]);
  secondObj.feature = secondObj.toGeoJSON();
  let subject = mapApiMixinObject.create();

  //Act
  let result = subject._getDistanceBetweenObjects(firstObj, secondObj);

  //Assert
  assert.equal(result, 111.19508023354534, 'Equals rezult distance with test distance');
});
