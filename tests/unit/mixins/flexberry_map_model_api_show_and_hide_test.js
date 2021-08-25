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
let maplayers = Ember.A([layer1, layer2]);

test('test method showLayers with continueLoading = false', function (assert) {
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
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = false;
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.returns(Ember.RSVP.resolve());
  let findByStub = sinon.stub(subject.mapLayer, 'findBy', arrayFindBy);

  //Act
  let result = subject.showLayers(['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
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
    mapLayer: maplayers
  });

  leafletObject.options.continueLoading = true;
  let leafletMapFireStub = sinon.stub(map, 'fire');
  leafletMapFireStub.returns(Ember.RSVP.resolve());
  let findByStub = sinon.stub(subject.mapLayer, 'findBy', arrayFindBy);

  //Act
  let result = subject.showLayers(['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
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
  //Arrange
  assert.expect(2);
  let done = assert.async(1);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let subject = mapApiMixinObject.create({
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
  let findByStub = sinon.stub(subject.mapLayer, 'findBy', arrayFindBy);

  //Act
  let result = subject.showAllLayerObjects('1');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 'Is not a vector layer');
    done();
    findByStub.restore();
  });
});

test('test method hideAllLayerObjects', function (assert) {
  //Arrange
  assert.expect(4);

  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  map.addLayer(firstTestLayer);
  map.addLayer(secondTestLayer);
  map.addLayer(thirdTestLayer);
  map.addLayer(_labelsLayer);

  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() { return map; }
    },
    mapLayer: maplayers
  });

  let findByStub = sinon.stub(subject.mapLayer, 'findBy', arrayFindBy);

  //Act
  assert.throws(
    function () { subject.hideAllLayerObjects('1'); },
    function (err) { return err.toString() === 'Is not a vector layer'; },
    'Error thrown'
  );

  //Assert
  assert.equal(findByStub.callCount, 1);
  assert.equal(findByStub.args[0][0], 'id');
  assert.equal(findByStub.args[0][1], '1');
  findByStub.restore();
});

test('test method hideLayers with continueLoading = false', function (assert) {
  //Arrange
  assert.expect(5);

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
  let findByStub = sinon.stub(subject.mapLayer, 'findBy', arrayFindBy);

  //Act
  subject.hideLayers(['1']);

  //Assert
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
  //Arrange
  assert.expect(5);

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
  let findByStub = sinon.stub(subject.mapLayer, 'findBy', arrayFindBy);

  //Act
  subject.hideLayers(['1']);

  //Assert
  assert.equal(getModelLayerFeatureSpy.callCount, 0);
  assert.equal(leafletMapFireStub.callCount, 0);
  assert.equal(findByStub.callCount, 1);
  assert.equal(findByStub.args[0][0], 'id');
  assert.equal(findByStub.args[0][1], '1');
  getModelLayerFeatureSpy.restore();
  leafletMapFireStub.restore();
  findByStub.restore();
});
