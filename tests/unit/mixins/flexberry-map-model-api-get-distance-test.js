import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | test method _getDistanceBetweenObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method getDistanceBetweenObjects between polyline and polygon', function(assert) {
  //Arrange
  let done = assert.async(1);
  let firstObj = L.polyline([[1.001, 1.001], [1.003, 1.003], [1.005, 1.005]]);
  firstObj.feature = firstObj.toGeoJSON();
  let secondObj = L.polygon([[1.001, 1.001], [1.001, 1.002], [1.003, 1.001], [1.003, 0]]);
  secondObj.feature = secondObj.toGeoJSON();
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId) {
      if (layerId === '1') {
        return Ember.RSVP.resolve([null, null, [firstObj]]);
      } else {
        return Ember.RSVP.resolve([null, null, [secondObj]]);
      }
    }
  });

  //Act
  let result = subject.getDistanceBetweenObjects('1', null, '2', null);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 55820.041009409564);
    done();
  });
});

test('test method getDistanceBetweenObjects between marker and polygon', function(assert) {
  //Arrange
  let done = assert.async(1);
  let firstObj = L.marker([1.001, 1.001]);
  firstObj.feature = firstObj.toGeoJSON();
  let secondObj = L.polygon([[1.001, 1.001], [1.001, 1.002], [1.003, 1.001], [1.003, 0]]);
  secondObj.feature = secondObj.toGeoJSON();
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId) {
      if (layerId === '1') {
        return Ember.RSVP.resolve([null, null, [firstObj]]);
      } else {
        return Ember.RSVP.resolve([null, null, [secondObj]]);
      }
    }
  });

  //Act
  let result = subject.getDistanceBetweenObjects('1', null, '2', null);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 55597.65129192688);
    done();
  });
});

test('test method getDistanceBetweenObjects between marker and marker', function(assert) {
  //Arrange
  let done = assert.async(1);
  let firstObj = L.marker([1.001, 1.001]);
  firstObj.feature = firstObj.toGeoJSON();
  let secondObj = L.marker([1.001, 1.002]);
  secondObj.feature = secondObj.toGeoJSON();
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId) {
      if (layerId === '1') {
        return Ember.RSVP.resolve([null, null, [firstObj]]);
      } else {
        return Ember.RSVP.resolve([null, null, [secondObj]]);
      }
    }
  });

  //Act
  let result = subject.getDistanceBetweenObjects('1', null, '2', null);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 111.19508023354534);
    done();
  });
});
