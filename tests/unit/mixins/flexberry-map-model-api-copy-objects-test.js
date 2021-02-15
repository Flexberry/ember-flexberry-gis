import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method copyObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let sourceLeafletLayer = L.featureGroup();
let destinationLeafletLayer = L.featureGroup();
let testPolygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
testPolygon.feature = { properties: { hello: 'word' } };
let smallPolygons = [
  testPolygon,
  testPolygon,
  testPolygon,
  testPolygon,
  testPolygon
];

let bigPolygons = [];
for (let i = 0; i < 10000; i++) {
  let polygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
  polygon.feature =  { properties: {} };
  bigPolygons.push(polygon);
}

let destinationLayerModel = Ember.A({
  settingsAsObject: {
    typeGeometry: 'polygon'
  }
});

test('test method copyObjects on small array (with properties)', function(assert) {
  //Arrange
  assert.expect(9);
  let done = assert.async(1);

  let getModelLayerFeature = () => { return Ember.RSVP.resolve([{}, sourceLeafletLayer, smallPolygons]); };

  let getModelLeafletObject = () => { return [destinationLayerModel, destinationLeafletLayer]; };

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {},
    _getModelLeafletObject() {}
  });
  let getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);

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
    assert.deepEqual(data[0].feature.properties.hello, 'word', 'Check properties');
    assert.equal(getMLFeature.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.deepEqual(getMLFeature.args[0][1], ['1'], 'Check call second arg to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][2], true, 'Check call third arg to method _getModelLayerFeature');
    assert.equal(getMLObject.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    done();
    getMLFeature.restore();
    getMLObject.restore();
  });
});

test('test method copyObjects on big array (without properties)', function(assert) {
  //Arrange
  assert.expect(7);
  let done = assert.async(1);

  let getModelLeafletObject = () => { return [destinationLayerModel, destinationLeafletLayer]; };

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
    loadingFeaturesByPackages() {}
  });
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);
  let getLFByPackage = sinon.stub(subject, 'loadingFeaturesByPackages', _loadingFeaturesByPackages);
  let objectIds = [];
  for (let i = 0; i < 101; i++) {
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
    assert.equal(getMLObject.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    assert.equal(getLFByPackage.callCount, 1, 'Check call count to method loadingFeaturesByPackages');
    assert.equal(getLFByPackage.args[0][0], '1', 'Check call first arg to method loadingFeaturesByPackages');
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
