import { resolve, Promise } from 'rsvp';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method copyObjects', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  const destinationLeafletLayer = L.featureGroup();
  const smallPolygons = [];
  for (let i = 0; i < 5; i++) {
    const testPolygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
    testPolygon.id = '1';
    testPolygon.feature = { properties: { hello: 'word', }, };
    smallPolygons.push(testPolygon);
  }

  const bigPolygons = [];
  for (let i = 0; i < 10000; i++) {
    const polygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
    polygon.feature = { properties: {}, };
    polygon.id = '1';
    bigPolygons.push(polygon);
  }

  const destinationLayerModel = A({
    settingsAsObject: {
      typeGeometry: 'polygon',
    },
  });

  test('test method copyObjects on small array (with properties and delete layer)', function (assert) {
    // Arrange
    assert.expect(12);
    const done = assert.async(1);
    const sourceLeafletLayer = L.featureGroup();
    smallPolygons.forEach((object) => {
      sourceLeafletLayer.addLayer(object);
    });
    const _loadingFeaturesByPackages = () => [resolve([{}, sourceLeafletLayer, []])];

    const _getLayerFeatureId = (model, object) => object.id;

    const subject = mapApiMixinObject.create({
      loadingFeaturesByPackages() {},
      _getModelLeafletObject() {},
      _getLayerFeatureId() {},
    });
    const loadingFBP = sinon.stub(subject, 'loadingFeaturesByPackages').callsFake(_loadingFeaturesByPackages);
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject');
    getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
    getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);
    const getLFid = sinon.stub(subject, '_getLayerFeatureId').callsFake(_getLayerFeatureId);

    // Act
    const result = subject.copyObjectsBatch({
      layerId: '1',
      objectIds: ['1'],
      shouldRemove: true,
    }, {
      layerId: '2',
      withProperties: true,
    });

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((data) => {
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

  test('test method copyObjects on small array (with properties)', function (assert) {
    // Arrange
    assert.expect(10);
    const done = assert.async(1);
    const sourceLeafletLayer = L.featureGroup();
    smallPolygons.forEach((object) => {
      sourceLeafletLayer.addLayer(object);
    });
    const _loadingFeaturesByPackages = () => [resolve([{}, sourceLeafletLayer, smallPolygons])];

    const subject = mapApiMixinObject.create({
      loadingFeaturesByPackages() {},
      _getModelLeafletObject() {},
      _getLayerFeatureId() {},
    });
    const loadingFBP = sinon.stub(subject, 'loadingFeaturesByPackages').callsFake(_loadingFeaturesByPackages);
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject');
    getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
    getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);

    // Act
    const result = subject.copyObjectsBatch({
      layerId: '1',
      objectIds: ['1'],
      shouldRemove: false,
    }, {
      layerId: '2',
      withProperties: true,
    });

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((data) => {
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

  test('test method copyObjects on big array (without properties and delete layers)', function (assert) {
    // Arrange
    assert.expect(12);
    const done = assert.async(1);
    const sourceLeafletLayer = L.featureGroup();
    bigPolygons.forEach((object) => {
      sourceLeafletLayer.addLayer(object);
    });
    const _getLayerFeatureId = (model, object) => object.id;

    const _loadingFeaturesByPackages = () => [
      resolve([null, sourceLeafletLayer, bigPolygons.slice(0, 2000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(2001, 4000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(4001, 6000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(6001, 8000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(8001, 9999)])
    ];

    const subject = mapApiMixinObject.create({
      _getModelLeafletObject() {},
      loadingFeaturesByPackages() {},
      _getLayerFeatureId() {},
    });
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject');
    getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
    getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);
    const getLFByPackage = sinon.stub(subject, 'loadingFeaturesByPackages').callsFake(_loadingFeaturesByPackages);
    const getLFid = sinon.stub(subject, '_getLayerFeatureId').callsFake(_getLayerFeatureId);

    const objectIds = [];
    for (let i = 1; i < 6; i++) {
      objectIds.push(String(i));
    }

    // Act
    const result = subject.copyObjectsBatch({
      layerId: '1',
      objectIds,
      shouldRemove: true,
    }, {
      layerId: '2',
      withProperties: false,
    });

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((data) => {
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

  test('test method copyObjects on big array (without properties)', function (assert) {
    // Arrange
    assert.expect(10);
    const done = assert.async(1);
    const sourceLeafletLayer = L.featureGroup();
    bigPolygons.forEach((object) => {
      sourceLeafletLayer.addLayer(object);
    });
    const _loadingFeaturesByPackages = () => [
      resolve([null, sourceLeafletLayer, bigPolygons.slice(0, 2000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(2001, 4000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(4001, 6000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(6001, 8000)]),
      resolve([null, sourceLeafletLayer, bigPolygons.slice(8001, 9999)])
    ];

    const subject = mapApiMixinObject.create({
      _getModelLeafletObject() {},
      loadingFeaturesByPackages() {},
      _getLayerFeatureId() {},
    });
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject');
    getMLObject.withArgs('1').returns([{}, sourceLeafletLayer]);
    getMLObject.withArgs('2').returns([destinationLayerModel, destinationLeafletLayer]);
    const getLFByPackage = sinon.stub(subject, 'loadingFeaturesByPackages').callsFake(_loadingFeaturesByPackages);

    const objectIds = [];
    for (let i = 1; i < 6; i++) {
      objectIds.push(String(i));
    }

    // Act
    const result = subject.copyObjectsBatch({
      layerId: '1',
      objectIds,
      shouldRemove: false,
    }, {
      layerId: '2',
      withProperties: false,
    });

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((data) => {
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

  test('test method copyObjects on not correct parmeters', function (assert) {
    // Arrange
    assert.expect(2);
    const done = assert.async(1);

    const subject = mapApiMixinObject.create({});

    // Act
    const result = subject.copyObjectsBatch({
      layerIdx: '1',
      objectId: ['2'],
      shouldRemove: true,
    }, {
      layerIds: '2',
      withProperties: true,
    });

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then(() => {}).catch((message) => {
      assert.equal(message.message, 'Check the parameters you are passing', 'Check the error message');
      done();
    });
  });
});
