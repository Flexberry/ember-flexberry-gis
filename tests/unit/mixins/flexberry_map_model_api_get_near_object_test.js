import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import OdataLayer from 'ember-flexberry-gis/layers/odata-vector';

module('Unit | Mixin | test api get near object');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let layerOne = L.featureGroup();
let firstObject = L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]]).addTo(layerOne);
firstObject.id = '111';
firstObject.options = {
  metadataUrl: ''
};
firstObject.modelName = '';

let layerSecond = L.featureGroup();
layerSecond.id = '2';
let firstObjectInSecond = L.polygon([[1, 2], [4.00001, 2], [4, 4], [1, 2]]).addTo(layerSecond);
firstObjectInSecond.id = '11';

let secondObjectInSecond = L.polygon([[6, 3], [4, 2], [4, 4], [6, 3]]).addTo(layerSecond);
secondObjectInSecond.id = '21';

let layerOneModel = Ember.A({
  _leafletObject: layerOne,
  id: '1',
  type: new OdataLayer()
});

let layerSecondModel = Ember.A({
  _leafletObject: layerSecond,
  id: '2',
  type: null
});

let layerArray = [layerOneModel, layerSecondModel];

test('test method getNearObjects with odataLayer', function (assert) {
  //Arrange
  assert.expect(4);
  let done = assert.async(1);
  let server = sinon.fakeServer.create();
  server.respondWith([
    200,
    { 'Content-Type': 'application/json' },
    '{"className": null, "distance": 0, "pk": "111"}'
  ]);
  server.respondImmediately = true;
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    resolveRegistration() {
      return {
        'APP': {
          'backendUrls': {
            'getNearDistance': 'fff'
          }
        }
      };
    }
  });

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectIds) {
      return new Ember.RSVP.Promise((resolve) => {
        layerArray.forEach((item) => {
          if (layerId === item.id) {
            let findedObjects = Object.values(item._leafletObject._layers);
            if (objectIds !== null) {
              findedObjects = findedObjects.filter((object) => {
                return objectIds.indexOf(object.id) !== -1;
              });
            };
            return resolve([item, item._leafletObject, findedObjects]);
          }
        });
      });
    },
    getLayerModel(layerId) {
      let layerModel = null;
      layerArray.forEach((item) => {
        if (layerId === item.id) {
          layerModel =  item;
        }
      });
      return layerModel;
    },
    _getTypeLayer(layer) {
      return layer.type;
    },
    _getLayerFeatureId(layer, obj) {
      return obj.id;
    }
  });

  //Act
  let result = subject.getNearObject('2', '11', ['1']);
  server.respond();

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Result should be promise');
  result.then((res)=> {
    assert.equal(res.distance, 0, 'Distance beetween objects equal 0');
    assert.equal(res.layer.id, '1', 'Layer id where found nearestObject equal 1');
    assert.equal(res.object.id, '111', 'Object with nearest distance to desired object');
    done();
    server.restore();
    configStub.restore();
  });
});

test('test method getNearObjects with not odataLayer', function (assert) {
  //Arrange
  assert.expect(4);
  let done = assert.async(1);
  let server = sinon.fakeServer.create();
  server.respondWith([
    200,
    { 'Content-Type': 'application/json' },
    '{"className": null, "distance": 0, "pk": "111"}'
  ]);
  server.respondImmediately = true;
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    resolveRegistration() {
      return {
        'APP': {
          'backendUrls': {
            'getNearDistance': 'fff'
          }
        }
      };
    }
  });

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectIds) {
      return new Ember.RSVP.Promise((resolve) => {
        layerArray.forEach((item) => {
          if (layerId === item.id) {
            let findedObjects = Object.values(item._leafletObject._layers);
            if (objectIds !== null) {
              findedObjects = findedObjects.filter((object) => {
                return objectIds.indexOf(object.id) !== -1;
              });
            }
            return resolve([item, item._leafletObject, findedObjects]);
          }
        });
      });
    },
    getLayerModel(layerId) {
      let layerModel = null;
      layerArray.forEach((item) => {
        if (layerId === item.id) {
          layerModel =  item;
        }
      });
      return layerModel;
    },
    _getTypeLayer(layer) {
      return layer.type;
    },
    _getLayerFeatureId(layer, obj) {
      return obj.id;
    }
  });

  //Act
  let result = subject.getNearObject('1', '111', ['2']);
  server.respond();

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Result should be promise');
  result.then((res)=> {
    assert.equal(res.distance.toFixed(1), 0.6, 'Distance beetween objects equal 0');
    assert.equal(res.layer.id, '2', 'Layer id where found nearestObject equal 1');
    assert.equal(res.object.id, '11', 'Object with nearest distance to desired object');
    done();
    server.restore();
    configStub.restore();
  });
});
