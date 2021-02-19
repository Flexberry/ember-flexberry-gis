import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method copyObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let destinationLeafletLayer = L.featureGroup();
let smallPolygons = [];
for (let i = 0; i < 5; i++) {
  let testPolygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
  testPolygon.id = '1';
  testPolygon.feature = { properties: { hello: 'word' } };
  smallPolygons.push(testPolygon);
}

let bigPolygons = [];
for (let i = 0; i < 10000; i++) {
  let polygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
  polygon.feature =  { properties: {} };
  polygon.id = '1';
  bigPolygons.push(polygon);
}

let destinationLayerModel = Ember.A({
  settingsAsObject: {
    typeGeometry: 'polygon'
  }
});

test('test method copyObjects on small array (with properties and delete layer)', function(assert) {
  //Arrange
  assert.expect(12);
  let done = assert.async(1);
  let sourceLeafletLayer = L.featureGroup();
  smallPolygons.forEach(object => {
    sourceLeafletLayer.addLayer(object);
  });
  let _loadingFeaturesByPackages = () => { return [Ember.RSVP.resolve([{}, sourceLeafletLayer, []])]; };

  let _getLayerFeatureId = (model, object) => { return object.id; };

  let subject = mapApiMixinObject.create({
    loadingFeaturesByPackages() {},
    _getModelLeafletObject() {},
    _getLayerFeatureId() {}
  });
  let loadingFBP = sinon.stub(subject, 'loadingFeaturesByPackages', _loadingFeaturesByPackages);
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject');
  getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
  getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);
  let getLFid = sinon.stub(subject, '_getLayerFeatureId', _getLayerFeatureId);

  //Act
  let result = subject.copyObjectsBatch({
    layerId: '1',
    objectIds: ['1'],
    shouldRemove: true
  }, {
    layerId: '2',
    withProperties: true
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Check result instance of Promise');
  result.then((data)=> {
    assert.deepEqual(data[0].getLatLngs(), [[L.latLng(1, 1), L.latLng(5, 1), L.latLng(2, 2), L.latLng(3, 5)]], 'Check latLngs');
    assert.deepEqual(Object.values(sourceLeafletLayer._layers).length, 0, 'Check length ');
    assert.deepEqual(data[0].feature.properties.hello, 'word', 'Check properties');
    assert.equal(loadingFBP.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(loadingFBP.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(loadingFBP.args[0][1], ['1'], 'Check call second arg to method _getModelLayerFeature');
    assert.equal(loadingFBP.args[0][2], true, 'Check call third arg to method _getModelLayerFeature');
    assert.equal(getMLObject.callCount, 2, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    assert.deepEqual(getLFid.args[0][0], {}, 'Check call first arg to method _getLayerFeatureId');
    assert.equal(getLFid.args[0][1].id, '1', 'Check call second arg to method _getLayerFeatureId');
    done();
    loadingFBP.restore();
    getMLObject.restore();
    getLFid.restore();
  });
});

test('test method copyObjects on small array (with properties)', function(assert) {
  //Arrange
  assert.expect(10);
  let done = assert.async(1);
  let sourceLeafletLayer = L.featureGroup();
  smallPolygons.forEach(object => {
    sourceLeafletLayer.addLayer(object);
  });
  let _loadingFeaturesByPackages = () => { return [Ember.RSVP.resolve([{}, sourceLeafletLayer, smallPolygons])]; };

  let subject = mapApiMixinObject.create({
    loadingFeaturesByPackages() {},
    _getModelLeafletObject() {},
    _getLayerFeatureId() {}
  });
  let loadingFBP = sinon.stub(subject, 'loadingFeaturesByPackages', _loadingFeaturesByPackages);
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject');
  getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
  getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);

  //Act
  let result = subject.copyObjectsBatch({
    layerId: '1',
    objectIds: ['1'],
    shouldRemove: false
  }, {
    layerId: '2',
    withProperties: true
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Check result instance of Promise');
  result.then((data)=> {
    assert.deepEqual(data[0].getLatLngs(), [[L.latLng(1, 1), L.latLng(5, 1), L.latLng(2, 2), L.latLng(3, 5)]], 'Check latLngs');
    assert.deepEqual(Object.values(sourceLeafletLayer._layers).length, 5, 'Check length ');
    assert.deepEqual(data[0].feature.properties.hello, 'word', 'Check properties');
    assert.equal(loadingFBP.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(loadingFBP.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(loadingFBP.args[0][1], ['1'], 'Check call second arg to method _getModelLayerFeature');
    assert.equal(loadingFBP.args[0][2], false, 'Check call third arg to method _getModelLayerFeature');
    assert.equal(getMLObject.callCount, 2, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    done();
    loadingFBP.restore();
    getMLObject.restore();
  });
});

test('test method copyObjects on big array (without properties and delete layers)', function(assert) {
  //Arrange
  assert.expect(12);
  let done = assert.async(1);
  let sourceLeafletLayer = L.featureGroup();
  bigPolygons.forEach(object => {
    sourceLeafletLayer.addLayer(object);
  });
  let _getLayerFeatureId = (model, object) => { return object.id; };

  let _loadingFeaturesByPackages = () => { return [
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(0, 2000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(2001, 4000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(4001, 6000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(6001, 8000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(8001, 9999)])
    ];
  };

  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {},
    loadingFeaturesByPackages() {},
    _getLayerFeatureId() {}
  });
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject');
  getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
  getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);
  let getLFByPackage = sinon.stub(subject, 'loadingFeaturesByPackages', _loadingFeaturesByPackages);
  let getLFid = sinon.stub(subject, '_getLayerFeatureId', _getLayerFeatureId);

  let objectIds = [];
  for (let i = 1; i < 6; i++) {
    objectIds.push(String(i));
  }

  //Act
  let result = subject.copyObjectsBatch({
    layerId: '1',
    objectIds: objectIds,
    shouldRemove: true
  }, {
    layerId: '2',
    withProperties: false
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Check result instance of Promise');
  result.then((data)=> {
    assert.deepEqual(data[0].getLatLngs(), [[L.latLng(1, 1), L.latLng(5, 1), L.latLng(2, 2), L.latLng(3, 5)]], 'Check latLngs');
    assert.deepEqual(data[0].feature.properties, {}, 'Check properties');
    assert.deepEqual(Object.values(sourceLeafletLayer._layers).length, 0, 'Check length ');
    assert.equal(getMLObject.callCount, 2, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getLFByPackage.callCount, 1, 'Check call count to method loadingFeaturesByPackages');
    assert.equal(getLFByPackage.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(getLFByPackage.args[0][1], ['1', '2', '3', '4', '5'], 'Check call second arg to method _getModelLayerFeature');
    assert.equal(getLFByPackage.args[0][2], true, 'Check call third arg to method _getModelLayerFeature');
    assert.deepEqual(getLFid.args[0][0], {}, 'Check call first arg to method _getLayerFeatureId');
    assert.equal(getLFid.args[0][1].id, '1', 'Check call second arg to method _getLayerFeatureId');
    done();
    getMLObject.restore();
    getLFByPackage.restore();
    getLFid.restore();
  });
});

test('test method copyObjects on big array (without properties)', function(assert) {
  //Arrange
  assert.expect(10);
  let done = assert.async(1);
  let sourceLeafletLayer = L.featureGroup();
  bigPolygons.forEach(object => {
    sourceLeafletLayer.addLayer(object);
  });
  let _loadingFeaturesByPackages = () => { return [
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(0, 2000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(2001, 4000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(4001, 6000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(6001, 8000)]),
      Ember.RSVP.resolve([null, sourceLeafletLayer, bigPolygons.slice(8001, 9999)])
    ];
  };

  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {},
    loadingFeaturesByPackages() {},
    _getLayerFeatureId() {}
  });
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject');
  getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
  getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);
  let getLFByPackage = sinon.stub(subject, 'loadingFeaturesByPackages', _loadingFeaturesByPackages);

  let objectIds = [];
  for (let i = 1; i < 6; i++) {
    objectIds.push(String(i));
  }

  //Act
  let result = subject.copyObjectsBatch({
    layerId: '1',
    objectIds: objectIds,
    shouldRemove: false
  }, {
    layerId: '2',
    withProperties: false
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Check result instance of Promise');
  result.then((data)=> {
    assert.deepEqual(data[0].getLatLngs(), [[L.latLng(1, 1), L.latLng(5, 1), L.latLng(2, 2), L.latLng(3, 5)]], 'Check latLngs');
    assert.deepEqual(data[0].feature.properties, {}, 'Check properties');
    assert.deepEqual(Object.values(sourceLeafletLayer._layers).length, 10000, 'Check length ');
    assert.equal(getMLObject.callCount, 2, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getLFByPackage.callCount, 1, 'Check call count to method loadingFeaturesByPackages');
    assert.equal(getLFByPackage.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(getLFByPackage.args[0][1], ['1', '2', '3', '4', '5'], 'Check call second arg to method _getModelLayerFeature');
    assert.equal(getLFByPackage.args[0][2], false, 'Check call third arg to method _getModelLayerFeature');
    done();
    getMLObject.restore();
    getLFByPackage.restore();
  });
});

test('test method copyObjects on not correct parmeters', function(assert) {
  //Arrange
  assert.expect(2);
  let done = assert.async(1);

  let subject = mapApiMixinObject.create({});

  //Act
  let result = subject.copyObjectsBatch({
    layerIdx: '1',
    objectId: ['2'],
    shouldRemove: true
  }, {
    layerIds: '2',
    withProperties: true
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Check result instance of Promise');
  result.then(()=> {}).catch((message) => {
    assert.equal(message, 'Check the parameters you are passing', 'Check the error message');
    done();
  });
});
