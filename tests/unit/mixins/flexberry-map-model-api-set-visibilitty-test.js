import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | test method setVisibility ');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let layerModel = Ember.Component.extend({
  visibility: false
});

test('Test visibility = true', function(assert) {
  //Arrange
  assert.expect(9);
  let firstLayer = layerModel.create({
    id: '1'
  });
  let secondLayer = layerModel.create({
    id: '2'
  });
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  map.on('flexberry-map:moveend', ()=> {});
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() { return map; }
    },
    mapLayer: Ember.A([firstLayer, secondLayer]),
  });
  let mapFireSpy = sinon.stub(map, 'fire', (name, e) => {
    e.results = Ember.A([{ promise: Ember.RSVP.resolve() }]);
  });
  let mapLayerFindSpy = sinon.spy(subject.mapLayer, 'findBy');

  //Act
  let result = subject._setVisibility(['1'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'success', 'Check result message');
    assert.equal(firstLayer.get('visibility'), true, 'Check firstLayer visibility');
    assert.equal(secondLayer.get('visibility'), false, 'Check secondLayer visibility');
    assert.equal(mapFireSpy.callCount, 1, 'Check call count method fire on map');
    assert.equal(mapFireSpy.args[0][0], 'flexberry-map:moveend', 'Check first argument method fire on map');
    assert.equal(mapLayerFindSpy.callCount, 1, 'Check call count method findBy on Array');
    assert.equal(mapLayerFindSpy.args[0][0], 'id', 'Check first argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[0][1], '1', 'Check second argument method findBy on Array');
    done();
    mapFireSpy.restore();
    mapLayerFindSpy.restore();
  });
});

test('Test visibility = false', function(assert) {
  //Arrange
  assert.expect(10);
  let firstLayer = layerModel.create({
    id: '1'
  });
  let secondLayer = layerModel.create({
    id: '2'
  });
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  map.on('flexberry-map:moveend', ()=> {});
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() { return map; }
    },
    mapLayer: Ember.A([firstLayer, secondLayer]),
  });
  let mapFireSpy = sinon.stub(map, 'fire', (name, e) => {
    e.results = Ember.A([{ promise: Ember.RSVP.resolve() }]);
  });
  let mapLayerFindSpy = sinon.spy(subject.mapLayer, 'findBy');

  //Act
  let result = subject._setVisibility(['1', '2']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'success', 'Check result message');
    assert.equal(firstLayer.get('visibility'), false, 'Check firstLayer visibility');
    assert.equal(secondLayer.get('visibility'), false, 'Check secondLayer visibility');
    assert.equal(mapFireSpy.callCount, 0, 'Check call count method fire on map');
    assert.equal(mapLayerFindSpy.callCount, 2, 'Check call count method findBy on Array');
    assert.equal(mapLayerFindSpy.args[0][0], 'id', 'Check first argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[0][1], '1', 'Check second argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[1][0], 'id', 'Check first argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[1][1], '2', 'Check second argument method findBy on Array');
    done();
    mapFireSpy.restore();
    mapLayerFindSpy.restore();
  });
});

test('Test not founded layers', function(assert) {
  //Arrange
  assert.expect(8);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  map.on('flexberry-map:moveend', ()=> {});
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() { return map; }
    },
    mapLayer: Ember.A([]),
  });
  let mapFireSpy = sinon.stub(map, 'fire', (name, e) => {
    e.results = Ember.A([{ promise: Ember.RSVP.resolve() }]);
  });
  let mapLayerFindSpy = sinon.spy(subject.mapLayer, 'findBy');

  //Act
  let result = subject._setVisibility(['3', '4'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.catch((res)=> {
    assert.equal(res, 'Layer \'3\' not found.', 'Check result message');
    assert.equal(mapFireSpy.callCount, 0, 'Check call count method fire on map');
    assert.equal(mapLayerFindSpy.callCount, 2, 'Check call count method findBy on Array');
    assert.equal(mapLayerFindSpy.args[0][0], 'id', 'Check first argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[0][1], '3', 'Check second argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[1][0], 'id', 'Check first argument method findBy on Array');
    assert.equal(mapLayerFindSpy.args[1][1], '4', 'Check second argument method findBy on Array');
    done();
    mapFireSpy.restore();
    mapLayerFindSpy.restore();
  });
});

test('Test array is empty', function(assert) {
  //Arrange
  assert.expect(4);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  map.on('flexberry-map:moveend', ()=> {});
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() { return map; }
    },
    mapLayer: Ember.A([]),
  });
  let mapFireSpy = sinon.stub(map, 'fire', (name, e) => {
    e.results = Ember.A([{ promise: Ember.RSVP.resolve() }]);
  });
  let mapLayerFindSpy = sinon.spy(subject.mapLayer, 'findBy');

  //Act
  let result = subject._setVisibility([], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.catch((res)=> {
    assert.equal(res, 'all layerIds is not found', 'Check result message');
    assert.equal(mapFireSpy.callCount, 0, 'Check call count method fire on map');
    assert.equal(mapLayerFindSpy.callCount, 0, 'Check call count method findBy on Array');
    done();
    mapFireSpy.restore();
    mapLayerFindSpy.restore();
  });
});

test('Test parametr is not a array', function(assert) {
  //Arrange
  assert.expect(2);
  let done = assert.async(1);
  let subject = mapApiMixinObject.create();

  //Act
  let result = subject._setVisibility();

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.catch((res)=> {
    assert.equal(res, 'Parametr is not a Array', 'Check result message');
    done();
  });
});

