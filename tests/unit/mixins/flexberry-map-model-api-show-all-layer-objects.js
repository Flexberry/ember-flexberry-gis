import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import OdataVector from 'ember-flexberry-gis/layers/odata-vector';

module('Unit | Mixin | test method');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method showAllLayerObjects continueLoading - true', function(assert) {
  //Arrange
  let done = assert.async(1);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let leafletObject = L.featureGroup().addTo(map);
  leafletObject.options = {
    showExisting: false,
    continueLoading: true
  };
  leafletObject.addLayer(L.polygon([[1, 1]]));
  let subject = mapApiMixinObject.create({
    mapLayer: {
      findBy() { return Ember.A({ _leafletObject: leafletObject }); }
    },
    _getTypeLayer() { return new OdataVector(); },
    mapApi: { getFromApi() { return map; } }
  });
  let spyHasLayer = sinon.spy(map, 'hasLayer');
  let spyAddLayer = sinon.spy(map, 'addLayer');

  //Act
  subject.showAllLayerObjects();

  //Assert
  Ember.RSVP.resolve().then(()=> {
    assert.equal(spyHasLayer.callCount, 1);
    assert.equal(spyAddLayer.callCount, 0);
    done();
  });
});

test('test method showAllLayerObjects continueLoading - false', function(assert) {
  //Arrange
  let done = assert.async(1);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let leafletObject = L.featureGroup().addTo(map);
  leafletObject.options = {
    showExisting: false,
    continueLoading: false
  };
  leafletObject.addLayer(L.polygon([[1, 1]]));
  let subject = mapApiMixinObject.create({
    mapLayer: {
      findBy() { return Ember.A({ _leafletObject: leafletObject }); }
    },
    _getTypeLayer() { return new OdataVector(); },
    _getModelLayerFeature(...args) { return new Ember.RSVP.Promise((resolve) => {
      leafletObject.addLayer(L.polygon([[1, 1]]));
      resolve();
    });},
    mapApi: { getFromApi() { return map; } }
  });
  let spyHasLayer = sinon.spy(map, 'hasLayer');
  let spyAddLayer = sinon.spy(map, 'addLayer');
  let spyRemoveLayer = sinon.spy(map, 'removeLayer');

  //Act
  subject.showAllLayerObjects();

  //Assert
  let promise = new Ember.RSVP.Promise((resolve) => {
    Ember.RSVP.resolve().then(()=> {
      resolve();
    });
  });
  promise.then(()=> {
    assert.equal(spyHasLayer.callCount, 4);
    assert.equal(spyAddLayer.callCount, 1);
    assert.equal(spyRemoveLayer.callCount, 2);
    done();
  });
});
