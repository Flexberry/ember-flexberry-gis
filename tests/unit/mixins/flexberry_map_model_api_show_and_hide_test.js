import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';

module('Unit | Mixin | test api show and hide layers');

let arrayFindBy = function(prop, value) {
  return this.filter((elem) => {
    if (elem.hasOwnProperty(prop)) {
      return elem[prop] === value;
    }
  })[0];
};

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

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

let layer1 = Ember.Object.create({
  id: '1',
  visibility: false,
  _leafletObject: leafletObject,
  settingsAsObject: {
    labelSettings: {
      signMapObjects: true
    }
  }
});
let layer2 = Ember.Object.create({
  id: '2',
  visibility: false,
  _leafletObject: leafletObject,
  settingsAsObject: {
    labelSettings: {
      signMapObjects: true
    }
  }
});
let maplayers = Array(layer1, layer2);

test('test method showLayers with continueLoading = false', function (assert) {
  //Arrange
  assert.expect(7);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); },
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = false;
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.returns(Ember.RSVP.resolve());
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.showLayers(['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(subject.mapLayer.findBy('id', '1').visibility, true);
    assert.equal(getModelLayerFeatureSpy.callCount, 1);
    assert.equal(getModelLayerFeatureSpy.args[0][0], '1');
    assert.deepEqual(getModelLayerFeatureSpy.args[0][1], null);
    assert.equal(leafletMapFireStub.callCount, 0);
    done();
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    Array.prototype.findBy = null;
  });
});

test('test method showLayers with continueLoading = true', function (assert) {
  //Arrange
  assert.expect(6);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); },
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = true;
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.returns(Ember.RSVP.resolve());
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.showLayers(['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(subject.mapLayer.findBy('id', '1').visibility, true);
    assert.equal(getModelLayerFeatureSpy.callCount, 0);
    assert.equal(leafletMapFireStub.callCount, 1);
    assert.equal(leafletMapFireStub.args[0][0], 'flexberry-map:moveend');
    done();
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    Array.prototype.findBy = null;
  });
});

test('test method showAllLayerObjects with continueLoading = false', function (assert) {
  //Arrange
  assert.expect(10);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getModelLayerFeature() {
      leafletObject.addLayer(firstTestLayer);
      leafletObject.addLayer(secondTestLayer);
      leafletObject.addLayer(thirdTestLayer);
      return Ember.RSVP.resolve([null, null, [firstTestLayer, secondTestLayer, thirdTestLayer]]);
    },
    mapLayer: maplayers
  });
  leafletObject.options.showExisting = false;
  leafletObject.options.continueLoading = false;
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.withArgs('flexberry-map:moveend').returns(Ember.RSVP.resolve());
  let mapAddSpy = sinon.spy(map, 'addLayer');
  let mapRemoveSpy = sinon.spy(map, 'removeLayer');
  let leafletObjectClearLayersSpy = sinon.spy(leafletObject, 'clearLayers');
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.showAllLayerObjects('1');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(getModelLayerFeatureSpy.callCount, 1);
    assert.equal(getModelLayerFeatureSpy.args[0][0], '1');
    assert.deepEqual(getModelLayerFeatureSpy.args[0][1], null);
    assert.equal(leafletMapFireStub.callCount, 8);
    assert.notEqual(leafletMapFireStub.args[0][0], 'flexberry-map:moveend');
    assert.equal(mapAddSpy.callCount, 8);
    assert.equal(mapRemoveSpy.callCount, 0);
    assert.equal(leafletObjectClearLayersSpy.callCount, 1);
    done();
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    mapAddSpy.restore();
    mapRemoveSpy.restore();
    leafletObjectClearLayersSpy.restore();
    Array.prototype.findBy = null;
  });
});

test('test method showAllLayerObjects with continueLoading = true', function (assert) {
  //Arrange
  assert.expect(8);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getModelLayerFeature() {
      leafletObject.addLayer(firstTestLayer);
      leafletObject.addLayer(secondTestLayer);
      leafletObject.addLayer(thirdTestLayer);
      return Ember.RSVP.resolve([null, null, [firstTestLayer, secondTestLayer, thirdTestLayer]]);
    },
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = true;
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.withArgs('flexberry-map:moveend').returns(Ember.RSVP.resolve());
  let mapAddSpy = sinon.spy(map, 'addLayer');
  let mapRemoveSpy = sinon.spy(map, 'removeLayer');
  let leafletObjectClearLayersSpy = sinon.spy(leafletObject, 'clearLayers');
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.showAllLayerObjects('1');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(getModelLayerFeatureSpy.callCount, 0);
    assert.equal(leafletMapFireStub.callCount, 9);
    assert.equal(leafletMapFireStub.args[0][0], 'flexberry-map:moveend');
    assert.equal(mapAddSpy.callCount, 8);
    assert.equal(mapRemoveSpy.callCount, 0);
    assert.equal(leafletObjectClearLayersSpy.callCount, 0);
    done();
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    mapAddSpy.restore();
    mapRemoveSpy.restore();
    leafletObjectClearLayersSpy.restore();
    Array.prototype.findBy = null;
  });
});

test('test method hideAllLayerObjects', function (assert) {
  //Arrange
  assert.expect(3);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  map.addLayer(firstTestLayer);
  map.addLayer(secondTestLayer);
  map.addLayer(thirdTestLayer);
  map.addLayer(_labelsLayer);

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    mapLayer: maplayers
  });

  let mapRemoveSpy = sinon.spy(map, 'removeLayer');
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.hideAllLayerObjects('1');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(mapRemoveSpy.callCount, 7);
    done();
    mapRemoveSpy.restore();
    Array.prototype.findBy = null;
  });
});

test('test method hideLayers with continueLoading = false', function (assert) {
  //Arrange
  assert.expect(5);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); },
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = false;
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.returns(Ember.RSVP.resolve());
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.hideLayers(['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(subject.mapLayer.findBy('id', '1').visibility, false);
    assert.equal(getModelLayerFeatureSpy.callCount, 0);
    assert.equal(leafletMapFireStub.callCount, 0);
    done();
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    Array.prototype.findBy = null;
  });
});

test('test method hideLayers with continueLoading = true', function (assert) {
  //Arrange
  assert.expect(5);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getModelLayerFeature() { return Ember.RSVP.resolve(); },
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = true;
  let getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.returns(Ember.RSVP.resolve());
  Array.prototype.findBy = arrayFindBy;

  //Act
  let result = subject.hideLayers(['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'success');
    assert.equal(subject.mapLayer.findBy('id', '1').visibility, false);
    assert.equal(getModelLayerFeatureSpy.callCount, 0);
    assert.equal(leafletMapFireStub.callCount, 0);
    done();
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    Array.prototype.findBy = null;
  });
});
