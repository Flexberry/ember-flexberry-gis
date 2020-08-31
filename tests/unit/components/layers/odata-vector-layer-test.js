import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import startApp from 'dummy/tests/helpers/start-app';
import { Query } from 'ember-flexberry-data';
import sinon from 'sinon';

let app;
let options;
let param;
let odataServerFake;

moduleForComponent('layers/odata-vector-layer', 'Unit | Component | layers/odata vector layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'adapter:application'
  ],
  beforeEach: function () {
    app = startApp();

    options = {
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      continueLoading: false
    };

    let leafletOptions = [
      'geometryField',
      'crs',
      'maxFeatures',
      'showExisting',
      'style',
      'forceMulti',
      'withCredentials',
      'continueLoading'
    ];

    param = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions
    };
    param = Ember.$.extend(param, options);

    odataServerFake = sinon.fakeServer.create();
    odataServerFake.autoRespond = true;

    odataServerFake.respondWith('POST', 'http://134.209.30.115:1818/odata/$batch',
      function (request) {
        request.respond(200, { 'Content-Type': 'multipart/mixed; boundary=batchresponse_3942662d-07b6-4e24-b466-fba5d37ca181' },
        '--batchresponse_3942662d-07b6-4e24-b466-fba5d37ca181\r\n' +
        'Content-Type: application/http\r\n' +
        'Content-Transfer-Encoding: binary\r\n' +
        '\r\n' +
        'HTTP/1.1 200 OK\r\n' +
        'Content-Type: application/json; charset=utf-8; odata.metadata=minimal\r\n' +
        'OData-Version: 4.0\r\n' +
        '\r\n' +
        '{\r\n' +
        '  "@odata.context":"http://134.209.30.115:1818/odata/$metadata#ModelTest(__PrimaryKey)","value":[\r\n' +
        '\r\n' +
        '  ]\r\n' +
        '}\r\n' +
        '--batchresponse_3942662d-07b6-4e24-b466-fba5d37ca181--');
      }
    );
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
    odataServerFake.restore();
  }
});

test('getFilterParameters return SimplePredicate on single value in array', function (assert) {
  assert.expect(2);
  var done = assert.async(1);
  Ember.run(() => {
    // arrange
    let component = this.subject();
    let linkParameter = Ember.Object.create({
      'queryKey': 'PK',
      'layerField': 'testField'
    });

    // act
    let result = component.getFilterParameters([linkParameter], { 'PK': ['id1'] });

    // assert
    let firstValue = result[0];
    assert.ok(firstValue instanceof Query.SimplePredicate);
    assert.equal(firstValue.toString(), '(testField eq id1)');
    done();
  });
});

test('loadLayerFeatures() with featureIds=null', function(assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    let store = app.__container__.lookup('service:store');
    store.createRecord('new-platform-flexberry-g-i-s-map-layer');
    Ember.$.extend(param, {
      'modelName': 'new-platform-flexberry-g-i-s-map-layer',
      'projectionName':'MapLayerL',
      'geometryField': 'geometryField',
      'store': store });

    let component = this.subject(param);

    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let getPkFieldStub = sinon.stub(mapModel, '_getLayerFeatureId');
    getPkFieldStub.returns('123');

    let e = {
      featureIds: null,
      layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
      results: Ember.A()
    };

    let leafletLayerPromiseResolved = assert.async();
    component.get('_leafletLayerPromise').then((leafletLayer) => {
      let _leafletObject = L.featureGroup();
      _leafletObject.options.showExisting = false;
      component.set('_leafletObject', _leafletObject);

      component.loadLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Load with null featureIds');
        done();
      });
    }).finally(() => {
      leafletLayerPromiseResolved();
    });

    assert.ok(component, 'Create odata-layer');
    done();
  });
});

test('getLayerFeatures() with featureIds=null', function(assert) {
  assert.expect(2);
  var done = assert.async(2);
  Ember.run(() => {
    let store = app.__container__.lookup('service:store');
    store.createRecord('new-platform-flexberry-g-i-s-map-layer');
    Ember.$.extend(param, {
      'modelName': 'new-platform-flexberry-g-i-s-map-layer',
      'projectionName':'MapLayerL',
      'geometryField': 'geometryField',
      'store': store });

    let component = this.subject(param);

    let getCountFeaturesStub = sinon.stub(component, 'getCountFeatures');
    getCountFeaturesStub.returns(Ember.RSVP.resolve(123));

    let e = {
      featureIds: null,
      layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
      results: Ember.A()
    };

    let leafletLayerPromiseResolved = assert.async();
    component.get('_leafletLayerPromise').then((leafletLayer) => {
      let _leafletObject = L.featureGroup();
      _leafletObject.options.showExisting = false;
      component.set('_leafletObject', _leafletObject);

      component.getLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Load with null featureIds');
        done();
      });
    }).finally(() => {
      leafletLayerPromiseResolved();
    });

    assert.ok(component, 'Create odata-layer');
    done();
  });
});
