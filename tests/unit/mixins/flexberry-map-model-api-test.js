import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | flexberry map model api test');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

// Replace this with your real tests.
test('it works FlexberryMapModelApiMixin', function (assert) {
  let subject = mapApiMixinObject.create();
  assert.ok(subject);
});

test('uploadFile should send post request with fileName and data to backend and return Ember.RSVP.Promise', function (assert) {
  assert.expect(4);
  let done = assert.async(1);
  let server = sinon.fakeServer.create();
  server.respondWith('uploadfileresponse');
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    resolveRegistration() {
      return {
        'APP': {
          'backendUrl': 'stubbackend'
        }
      };
    }
  });

  let subject = mapApiMixinObject.create();
  let payload = { 'name': 'testFile' };

  let result = subject.uploadFile(payload);
  server.respond();

  assert.ok(result instanceof Ember.RSVP.Promise);
  assert.deepEqual(server.requests[0].requestBody, payload);
  assert.equal(server.requests[0].url, 'stubbackend/controls/FileUploaderHandler.ashx?FileName=testFile');
  result.then((e) => {
    assert.equal(e, 'uploadfileresponse');
    done();
  });

  configStub.restore();
  server.restore();
});

test('test method getRhumb for LineString', function (assert) {
  //Arrange
  let done = assert.async(1);
  let testPolygon = L.polygon([[-41, -111.04], [45, -111.04], [45, -104.05], [41, -104.05]]);
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectId) {
      return Ember.RSVP.Promise.resolve([null, null, [testPolygon]]);
    }
  });
  const resObj = {
    type: 'LineString',
    startPoint: testPolygon._latlngs[0][0],
    crs: 'EPSG:4326',
    skip: 1,
    rhumbCoordinates:
    [
        {
          rhumb: 'СЗ',
          angle: 0,
          distance: 9562776.900083829
        },
        {
          rhumb: 'СВ',
          angle: 90,
          distance: 549601.2989213171
        },
        {
          rhumb: 'ЮВ',
          angle: 0,
          distance: 444780.32093413227
        },
        {
          rhumb: 'ЮЗ',
          angle: 4.438440688327262,
          distance: 9145423.193341617
        }
    ],
    coordinates: testPolygon._latlngs
  };

  //Act
  let promise = subject.getRhumb('', '');

  //Assert
  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then(
    (t) => {
      assert.deepEqual(t, resObj);
      done();
    });
});

test('test method getRhumb for Polygon', function (assert) {
  //Arrange
  let done = assert.async(1);
  let testPolygon = L.polygon([
    [
      [[-41, -111.04], [45, -111.04], [45, -104.05], [41, -104.05]]
    ]
  ]);
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectId) {
      return Ember.RSVP.Promise.resolve([null, null, [testPolygon]]);
    }
  });
  const resObj = {
    type: 'Polygon',
    startPoint: testPolygon._latlngs[0][0][0],
    crs: 'EPSG:4326',
    skip: 1,
    rhumbCoordinates:
    [
        {
          rhumb: 'СЗ',
          angle: 0,
          distance: 9562776.900083829
        },
        {
          rhumb: 'СВ',
          angle: 90,
          distance: 549601.2989213171
        },
        {
          rhumb: 'ЮВ',
          angle: 0,
          distance: 444780.32093413227
        },
        {
          rhumb: 'ЮЗ',
          angle: 4.438440688327262,
          distance: 9145423.193341617
        }
    ],
    coordinates: testPolygon._latlngs
  };

  //Act
  let promise = subject.getRhumb('', '');

  //Assert
  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then(
    (t) => {
      assert.deepEqual(t, resObj);
      done();
    });
});

module('Unit | Mixin | get object center');

test('return current center of point', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = L.marker([1, 1]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);

  //Assert
  assert.deepEqual(result, obj2._latlng);
});

test('return current center of polygon', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = L.polygon([[1, 1]]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);

  //Assert
  assert.deepEqual(result, obj2.getBounds().getCenter());
});

test('return current center of polyline', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = L.polyline([[1, 1]]);
  obj2.feature = obj2.toGeoJSON();

  //Act
  let result = subject.getObjectCenter(obj2);

  //Assert
  assert.deepEqual(result, obj2.getBounds().getCenter());
});

module('Unit | Mixin | get type layer');

test('test method getTypeLayer', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  let obj2 = { type: 'wfs' };
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    knownForType(st, className) {
      switch( className ){
        case 'wfs':
          return new WFS();
        case 'odata':
          return new odataVector();
      }
    }
  });

  //Act
  let result = subject._getTypeLayer(obj2);

  //Assert
  assert.ok(result instanceof WFS);
  configStub.restore();
});
