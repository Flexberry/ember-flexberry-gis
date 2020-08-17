import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | get object center');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('return current center of point', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = L.marker([1, 1]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);

  //Assert
  assert.deepEqual(result, obj2._latlng);
});

test('return current center of polygon', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = L.polygon([[1, 1]]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2).toString();

  //Assert
  assert.equal(result, 'LatLng(1, 1)');
});

test('return current center of polyline', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = L.polyline([[1, 1]]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2).toString();

  //Assert
  assert.equal(result, 'LatLng(1, 1)');
});
