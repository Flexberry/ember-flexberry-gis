import { resolve, Promise } from 'rsvp';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';

module('Unit | Mixin | test api show and hide layers', function () {
  const arrayFindBy = function (prop, value) {
    return this.filter((elem) => {
      if (Object.prototype.hasOwnProperty.call(elem, prop)) {
        return elem[prop] === value;
      }

      return false;
    })[0];
  };

  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  const _labelsLayer = L.featureGroup();
  const leafletObject = L.featureGroup();
  leafletObject.options = {
    showExisting: false,
    continueLoading: false,
  };
  leafletObject._labelsLayer = _labelsLayer;
  const firstTestLayer = L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]]).addTo(leafletObject);
  firstTestLayer.id = '1';
  const secondTestLayer = L.polygon([[10, 20], [40, 20], [40, 40], [10, 20]]).addTo(leafletObject);
  secondTestLayer.id = '2';
  const thirdTestLayer = L.polygon([[0.1, 0.2], [0.4, 0.2], [0.4, 0.4], [0.1, 0.2]]).addTo(leafletObject);
  thirdTestLayer.id = '3';
  const firstTestLabelLayer = L.marker([1, 2]).addTo(_labelsLayer);
  firstTestLabelLayer.id = '1';
  const secondTestLabelLayer = L.marker([40, 20]).addTo(_labelsLayer);
  secondTestLabelLayer.id = '2';
  const thirdTestLabelLayer = L.marker([20, 40]).addTo(_labelsLayer);
  thirdTestLabelLayer.id = '3';

  const layer1 = EmberObject.create({
    id: '1',
    visibility: false,
    _leafletObject: leafletObject,
    settingsAsObject: {
      labelSettings: {
        signMapObjects: true,
      },
    },
  });
  const layer2 = EmberObject.create({
    id: '2',
    visibility: false,
    _leafletObject: leafletObject,
    settingsAsObject: {
      labelSettings: {
        signMapObjects: true,
      },
    },
  });
  const maplayers = A([layer1, layer2]);

  test('test method showLayers with continueLoading = false', function (assert) {
    // Arrange
    assert.expect(6);
    const done = assert.async(1);

    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });

    const subject = mapApiMixinObject.create({
      _getTypeLayer() { return new VectorLayer(); },
      mapApi: {
        getFromApi() { return map; },
      },
      mapLayer: maplayers,
    });

    leafletObject.options.continueLoading = false;
    const leafletMapFireStub = sinon.stub(map, 'fire');
    leafletMapFireStub.returns(resolve());
    const findByStub = sinon.stub(subject.mapLayer, 'findBy').callsFake(arrayFindBy);

    // Act
    const result = subject.showLayers(['1']);

    // Assert
    assert.ok(result instanceof Promise);
    result.then((res) => {
      assert.equal(res, 'success');
      assert.equal(findByStub.callCount, 1);
      assert.equal(findByStub.args[0][0], 'id');
      assert.equal(findByStub.args[0][1], '1');
      assert.equal(leafletMapFireStub.callCount, 1);
      done();
      leafletMapFireStub.restore();
      findByStub.restore();
    });
  });

  test('test method showLayers with continueLoading = true', function (assert) {
    // Arrange
    assert.expect(7);
    const done = assert.async(1);

    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });

    const subject = mapApiMixinObject.create({
      _getTypeLayer() { return new VectorLayer(); },
      mapApi: {
        getFromApi() { return map; },
      },
      mapLayer: maplayers,
    });

    leafletObject.options.continueLoading = true;
    const leafletMapFireStub = sinon.stub(map, 'fire');
    leafletMapFireStub.returns(resolve());
    const findByStub = sinon.stub(subject.mapLayer, 'findBy').callsFake(arrayFindBy);

    // Act
    const result = subject.showLayers(['1']);

    // Assert
    assert.ok(result instanceof Promise);
    result.then((res) => {
      assert.equal(res, 'success');
      assert.equal(findByStub.callCount, 1);
      assert.equal(findByStub.args[0][0], 'id');
      assert.equal(findByStub.args[0][1], '1');
      assert.equal(leafletMapFireStub.callCount, 1);
      assert.equal(leafletMapFireStub.args[0][0], 'flexberry-map:moveend');
      done();
      leafletMapFireStub.restore();
      findByStub.restore();
    });
  });

  test('test method showAllLayerObjects with continueLoading = false', function (assert) {
    // Arrange
    assert.expect(2);
    const done = assert.async(1);

    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });

    const subject = mapApiMixinObject.create({
      mapApi: {
        getFromApi() { return map; },
      },
      _getModelLayerFeature() {
        leafletObject.addLayer(firstTestLayer);
        leafletObject.addLayer(secondTestLayer);
        leafletObject.addLayer(thirdTestLayer);
        return resolve([null, null, [firstTestLayer, secondTestLayer, thirdTestLayer]]);
      },
      mapLayer: maplayers,
    });
    leafletObject.options.showExisting = false;
    leafletObject.options.continueLoading = false;
    const findByStub = sinon.stub(subject.mapLayer, 'findBy').callsFake(arrayFindBy);

    // Act
    const result = subject.showAllLayerObjects('1');

    // Assert
    assert.ok(result instanceof Promise);
    result.then((res) => {
      assert.equal(res, 'Is not a vector layer');
      done();
      findByStub.restore();
    });
  });

  test('test method hideAllLayerObjects', function (assert) {
    // Arrange
    assert.expect(4);

    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });

    map.addLayer(firstTestLayer);
    map.addLayer(secondTestLayer);
    map.addLayer(thirdTestLayer);
    map.addLayer(_labelsLayer);

    const subject = mapApiMixinObject.create({
      mapApi: {
        getFromApi() { return map; },
      },
      mapLayer: maplayers,
    });

    const findByStub = sinon.stub(subject.mapLayer, 'findBy').callsFake(arrayFindBy);

    // Act
    assert.throws(
      function () { subject.hideAllLayerObjects('1'); },
      function (err) { return err.message.toString() === 'Is not a vector layer'; },
      'Error thrown'
    );

    // Assert
    assert.equal(findByStub.callCount, 1);
    assert.equal(findByStub.args[0][0], 'id');
    assert.equal(findByStub.args[0][1], '1');
    findByStub.restore();
  });

  test('test method hideLayers with continueLoading = false', function (assert) {
    // Arrange
    assert.expect(5);

    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });

    const subject = mapApiMixinObject.create({
      _getTypeLayer() { return new VectorLayer(); },
      mapApi: {
        getFromApi() { return map; },
      },
      _getModelLayerFeature() { return resolve(); },
      mapLayer: maplayers,
    });

    leafletObject.options.continueLoading = false;
    const getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
    const leafletMapFireStub = sinon.stub(map, 'fire');
    leafletMapFireStub.returns(resolve());
    const findByStub = sinon.stub(subject.mapLayer, 'findBy').callsFake(arrayFindBy);

    // Act
    subject.hideLayers(['1']);

    // Assert
    assert.equal(getModelLayerFeatureSpy.callCount, 0);
    assert.equal(leafletMapFireStub.callCount, 0);
    assert.equal(findByStub.callCount, 1);
    assert.equal(findByStub.args[0][0], 'id');
    assert.equal(findByStub.args[0][1], '1');
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    findByStub.restore();
  });

  test('test method hideLayers with continueLoading = true', function (assert) {
    // Arrange
    assert.expect(5);

    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });

    const subject = mapApiMixinObject.create({
      _getTypeLayer() { return new VectorLayer(); },
      mapApi: {
        getFromApi() { return map; },
      },
      _getModelLayerFeature() { return resolve(); },
      mapLayer: maplayers,
    });

    leafletObject.options.continueLoading = true;
    const getModelLayerFeatureSpy = sinon.spy(subject, '_getModelLayerFeature');
    const leafletMapFireStub = sinon.stub(map, 'fire');
    leafletMapFireStub.returns(resolve());
    const findByStub = sinon.stub(subject.mapLayer, 'findBy').callsFake(arrayFindBy);

    // Act
    subject.hideLayers(['1']);

    // Assert
    assert.equal(getModelLayerFeatureSpy.callCount, 0);
    assert.equal(leafletMapFireStub.callCount, 0);
    assert.equal(findByStub.callCount, 1);
    assert.equal(findByStub.args[0][0], 'id');
    assert.equal(findByStub.args[0][1], '1');
    getModelLayerFeatureSpy.restore();
    leafletMapFireStub.restore();
    findByStub.restore();
  });
});
