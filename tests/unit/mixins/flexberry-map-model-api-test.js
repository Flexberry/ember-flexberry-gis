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
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve([null, null,
          [
            {
              _latlngs:
              [
                [
                  { lng: 0, lat:0 },
                  { lng: 5, lat:5 },
                  { lng: 10, lat:10 },
                  { lng: 20, lat:20 }
                ]
              ]
            }
          ]
        ]);
      });
    }
  });
  const resObj = {
    type: 'LineString',
    startPoint: { lng: 0, lat:0 },
    crs: 'EPSG:4326',
    skip: 1,
    rhumbCoordinates:
    [
        {
          rhumb: 'СВ',
          angle: 44.96359274789586,
          distance: 785768.813079895
        },
        {
          rhumb: 'СВ',
          angle: 44.74445374906895,
          distance: 782784.4348582322
        },
        {
          rhumb: 'СВ',
          angle: 43.96540227096858,
          distance: 1544892.9354244978
        },
        {
          rhumb: 'ЮЗ',
          angle: 44.40609174830968,
          distance: 3112971.6381611135
        }
    ],
    coordinates:
    [
      [
        { lng: 0, lat:0 },
        { lng: 5, lat:5 },
        { lng: 10, lat:10 },
        { lng: 20, lat:20 }
      ]
    ]
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

test('test method getRhumb for Poligon', function (assert) {
  //Arrange
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve([null, null,
          [
            {
              _latlngs:
              [
                [
                  [
                    { lng: 0, lat:0 },
                    { lng: 5, lat:5 },
                    { lng: 10, lat:10 },
                    { lng: 20, lat:20 }
                  ]
                ]
              ]
            }
          ]
        ]);
      });
    }
  });
  const resObj = {
    type: 'Polygon',
    startPoint: { lng: 0, lat:0 },
    crs: 'EPSG:4326',
    skip: 1,
    rhumbCoordinates:
    [
        {
          rhumb: 'СВ',
          angle: 44.96359274789586,
          distance: 785768.813079895
        },
        {
          rhumb: 'СВ',
          angle: 44.74445374906895,
          distance: 782784.4348582322
        },
        {
          rhumb: 'СВ',
          angle: 43.96540227096858,
          distance: 1544892.9354244978
        },
        {
          rhumb: 'ЮЗ',
          angle: 44.40609174830968,
          distance: 3112971.6381611135
        }
    ],
    coordinates:
    [
      [
        [
          { lng: 0, lat:0 },
          { lng: 5, lat:5 },
          { lng: 10, lat:10 },
          { lng: 20, lat:20 }
        ]
      ]
    ]
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
  const object = {
    feature: {
      geometry: {
        type: 'Point'
      }
    },
    _latlng: { lat:0, long:0 }
  };

  //Act
  let result = subject.getObjectCenter(object);

  //Assert
  assert.deepEqual(result, { lat:0, long:0 });
});

test('return current center of not point', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  const object = {
    feature: {
      geometry: {
        type: 'not Point'
      }
    },
    getBounds() {
      return {
        getCenter() {
          return { lat: 5, long: 5 };
        }
      };
    }
  };

  //Act
  let result = subject.getObjectCenter(object);

  //Assert
  assert.deepEqual(result, { lat:5, long:5 });
});

test('return undefined on point', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  const object = {
    feature: {
      geometry: {
        type: 'Point'
      }
    }
  };

  //Act
  let result = subject.getObjectCenter(object);

  //Assert
  assert.deepEqual(result, undefined);
});

test('return error on getBounds of not point', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  const object = {
    feature: {
      geometry: {
        type: 'not Point'
      }
    }
  };

  //Act
  let result;
  try {
    subject.getObjectCenter(object);
  }
  catch (e) {
    result = e;
  }

  //Assert
  assert.ok(result);
});

test('return error on getCenter of not point', function(assert) {
  //Arrange
  let subject = mapApiMixinObject.create();
  const object = {
    feature: {
      geometry: {
        type: 'not Point'
      }
    },
    getBounds() {}
  };

  //Act
  let result;
  try {
    subject.getObjectCenter(object);
  }
  catch (e) {
    result = e;
  }

  //Assert
  assert.ok(result);
});
