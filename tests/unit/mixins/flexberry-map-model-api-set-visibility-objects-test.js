import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';

module('Unit | Mixin | test method setVisibilityObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let layerModel = Ember.A({
  settingsAsObject: {
    labelSettings: {
      signMapObjects: true
    }
  }
});
let _labelsLayer = L.featureGroup();
let leafletObject = L.featureGroup();
leafletObject.options = {
  showExisting: false,
  continueLoading: false
};
leafletObject._labelsLayer = _labelsLayer;
let firstTestLayer = L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]]).addTo(leafletObject);
firstTestLayer.id = '1';
let secondTestLayer = L.polygon([[10, 20], [40, 20], [40, 40], [10, 20]]).addTo(leafletObject);
secondTestLayer.id = '2';
let thirdTestLayer = L.polygon([[0.1, 0.2], [0.4, 0.2], [0.4, 0.4], [0.1, 0.2]]).addTo(leafletObject);
thirdTestLayer.id = '3';
let firstTestLabelLayer = L.marker([1, 2]).addTo(_labelsLayer);
firstTestLabelLayer.id = '1';
let secondTestLabelLayer = L.marker([40, 20]).addTo(_labelsLayer);
secondTestLabelLayer.id = '2';
let thirdTestLabelLayer = L.marker([20, 40]).addTo(_labelsLayer);
thirdTestLabelLayer.id = '3';

test('Test to addLayers to map (visibility = true)', function(assert) {
  //Arrange
  assert.expect(9);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); }
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let mapAddSpy = sinon.spy(map, 'addLayer');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'sucsess', 'Check result message');
    assert.equal(Object.values(map._layers).length, 5, 'Check count layers on Map');
    assert.equal(mapAddSpy.callCount, 5, 'Check call count to method addLayer');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLeafletObjSpy.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getModelLayerFeatureSpy.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(getModelLayerFeatureSpy.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(getModelLayerFeatureSpy.args[0][1], ['1', '2'], 'Check call second arg to method _getModelLayerFeature');
    done();
    getModelLeafletObjSpy.restore();
    getModelLayerFeatureSpy.restore();
    mapAddSpy.restore();
  });
});

test('Test to removeLayers to map (visibility = false)', function(assert) {
  //Arrange
  assert.expect(7);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let done = assert.async(1);
  map.addLayer(leafletObject);
  map.addLayer(leafletObject._labelsLayer);
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); }
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let mapRemoveSpy = sinon.spy(map, 'removeLayer');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], false);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'sucsess', 'Check result message');
    assert.equal(Object.values(map._layers).length, 5, 'Check count layers on Map');
    assert.equal(mapRemoveSpy.callCount, 4, 'Check call count to method removeLayer');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLeafletObjSpy.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getModelLayerFeatureSpy.callCount, 0, 'Check call count to method _getModelLayerFeature');
    done();
    getModelLeafletObjSpy.restore();
    getModelLayerFeatureSpy.restore();
    mapRemoveSpy.restore();
  });
});

test('Test to check fail message', function(assert) {
  //Arrange
  assert.expect(6);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let done = assert.async(1);
  leafletObject.options.continueLoading = true;
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); }
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let mapRemoveSpy = sinon.spy(map, 'removeLayer');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then(()=> { }).catch((res)=> {
    assert.equal(res, 'Not working to layer with continueLoading', 'Check result message');
    assert.equal(Object.values(map._layers).length, 0, 'Check count layers on Map');
    assert.equal(mapRemoveSpy.callCount, 0, 'Check call count to method removeLayer');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLayerFeatureSpy.callCount, 0, 'Check call count to method _getModelLayerFeature');
    done();
    leafletObject.options.continueLoading = false;
    getModelLeafletObjSpy.restore();
    getModelLayerFeatureSpy.restore();
    mapRemoveSpy.restore();
  });
});

test('Map doesn\'t layers and visibility = false', function(assert) {
  //Arrange
  assert.expect(6);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); }
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let mapRemoveSpy = sinon.spy(map, 'removeLayer');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], false);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'sucsess', 'Check result message');
    assert.equal(Object.values(map._layers).length, 0, 'Check count layers on Map');
    assert.equal(mapRemoveSpy.callCount, 4, 'Check call count to method removeLayer');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLayerFeatureSpy.callCount, 0, 'Check call count to method _getModelLayerFeature');
    done();
    getModelLeafletObjSpy.restore();
    getModelLayerFeatureSpy.restore();
    mapRemoveSpy.restore();
  });
});

test('Map doesn\'t layers and visibility = false', function(assert) {
  //Arrange
  assert.expect(9);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  map.addLayer(leafletObject);
  map.addLayer(leafletObject._labelsLayer);
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); }
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let mapAddSpy = sinon.spy(map, 'addLayer');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'sucsess', 'Check result message');
    assert.equal(Object.values(map._layers).length, 9, 'Check count layers on Map');
    assert.equal(mapAddSpy.callCount, 4, 'Check call count to method addLayer');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLeafletObjSpy.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getModelLayerFeatureSpy.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(getModelLayerFeatureSpy.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(getModelLayerFeatureSpy.args[0][1], ['1', '2'], 'Check call second arg to method _getModelLayerFeature');
    done();
    getModelLeafletObjSpy.restore();
    getModelLayerFeatureSpy.restore();
    mapAddSpy.restore();
  });
});

test('Test to check success message \'showExisting\'', function(assert) {
  //Arrange
  assert.expect(9);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let done = assert.async(1);
  leafletObject.options.showExisting = true;
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); }
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let mapAddSpy = sinon.spy(map, 'addLayer');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.then((res)=> {
    assert.equal(res, 'sucsess', 'Check result message');
    assert.equal(Object.values(map._layers).length, 5, 'Check count layers on Map');
    assert.equal(mapAddSpy.callCount, 5, 'Check call count to method addLayer');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLeafletObjSpy.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getModelLayerFeatureSpy.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(getModelLayerFeatureSpy.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(getModelLayerFeatureSpy.args[0][1], ['1', '2'], 'Check call second arg to method _getModelLayerFeature');
    done();
    leafletObject.options.showExisting = false;
    getModelLeafletObjSpy.restore();
    getModelLayerFeatureSpy.restore();
    mapAddSpy.restore();
  });
});
