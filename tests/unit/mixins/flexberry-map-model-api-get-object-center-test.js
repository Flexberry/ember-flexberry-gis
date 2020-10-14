import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | get object center');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('return current center of point', function(assert) {
  //Arrange
  assert.expect(1);
  let subject = mapApiMixinObject.create();
  let obj2 = L.marker([1, 1]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);
  let resObj = L.latLng(1, 1);

  //Assert
  assert.deepEqual(result, resObj, 'Equals rezult object with test object');
});

test('return current center of polygon', function(assert) {
  //Arrange
  assert.expect(1);
  let subject = mapApiMixinObject.create();
  let obj2 = L.polygon([[1, 1], [1, 2], [3, 1], [3, 0]]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);
  let resObj = L.latLng(2, 1);

  //Assert
  assert.deepEqual(result, resObj, 'Equals rezult object with test object');
});

test('return current center of polyline', function(assert) {
  //Arrange
  assert.expect(1);
  let subject = mapApiMixinObject.create();
  let obj2 = L.polyline([[1, 1], [3, 3], [5, 5]]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);
  let resObj = L.latLng(3, 3);

  //Assert
  assert.deepEqual(result, resObj, 'Equals rezult object with test object');
});
