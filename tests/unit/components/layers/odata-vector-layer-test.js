import Ember from 'ember';

import DS from 'ember-data';
import { moduleForComponent, test } from 'ember-qunit';
import startApp from 'dummy/tests/helpers/start-app';
import { Query, Projection } from 'ember-flexberry-data';
import sinon from 'sinon';
import { Serializer } from 'ember-flexberry-data';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';

let app;
let options;
let param;
let odataServerFake;
let bounds;
let store;

moduleForComponent('layers/odata-vector-layer', 'Unit | Component | layers/odata vector layer', {
  unit: true,
  needs: [
    'service:map-api',
    'service:layers-styles-renderer',
    'config:environment',
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'adapter:application',
    'layer:odata-vector'
  ],
  beforeEach: function () {
    app = startApp();

    let testModelMixin = Ember.Mixin.create({
      name: DS.attr('string', { defaultValue: '' }),
      shape: DS.attr('json')
    });

    let testModel = Projection.Model.extend(testModelMixin);
    testModel.defineProjection('TestModelL', 'test-model', {
      name: Projection.attr(''),
      shape: Projection.attr('')
    });

    let testSerializer = Serializer.Odata.extend({
      primaryKey: '__PrimaryKey'
    });

    this.register('model:test-model', testModel);
    this.register('mixin:test-model', testModelMixin);
    this.register('serializer:test-model', testSerializer);

    app.register('model:test-model', testModel);
    app.register('mixin:test-model', testModelMixin);
    app.register('serializer:test-model', testSerializer);

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

    bounds = L.latLngBounds(L.latLng(58.4436454695997, 56.369991302490234), L.latLng(58.46793791815783, 56.53478622436524));
    let getBounds = function() {
      return bounds;
    };

    let getPane = function() {
      return undefined;
    };

    let createPane = function() {
      return {};
    };

    store = app.__container__.lookup('service:store');
    Ember.$.extend(param, {
      'modelName': 'test-model',
      'projectionName':'TestModelL',
      'geometryField': 'shape',
      'typeName': 'test-model',
      'odataClass': 'TestModel',
      'continueLoading': true,
      'store': store,
      'layerModel': { 'type': 'odata-vector', 'visibility': true },
      'leafletMap': {
        getBounds,
        getPane,
        createPane
      }
    });

    odataServerFake = sinon.fakeServer.create();
    odataServerFake.autoRespond = true;

    const responseText = `--batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f
    Content-Type: application/http
    Content-Transfer-Encoding: binary

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#IISRGISPKVydelUtverzhdenoPolygon32640s(__PrimaryKey,ID,Name,Shape)","value":[
        {
          "__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a79b", "Name":null,"Shape":{
            "type":"MultiPolygon","coordinates":[
              [
                [
                  [468709.463318981,6478884.81118851],
            [468578.508624007,6478880.73565037],
            [468541.567377907,6478925.23599015],
            [468533.564191116,6478946.2331571],
            [468614.492922407,6478979.21144234],
            [468657.52589005,6478981.2057549],
            [468672.503518996,6478963.71619159],
            [468717.482394432,6478946.21010284],
            [468709.463318981,6478884.81118851]
                ]
              ]
            ],"crs":{
              "type":"name","properties":{
                "name":"EPSG:32640"
              }
            }
          }
      },

      {
          "__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a89b", "Name":null,"Shape":{
            "type":"MultiPolygon","coordinates":[
              [
                [
                  [468709.463318981,6478884.81118851],
            [468578.508624007,6478880.73565037],
            [468541.567377907,6478925.23599015],
            [468533.564191116,6478946.2331571],
            [468614.492922407,6478979.21144234],
            [468657.52589005,6478981.2057549],
            [468672.503518996,6478963.71619159],
            [468717.482394432,6478946.21010284],
            [468709.463318981,6478884.81118851]
                ]
              ]
            ],"crs":{
              "type":"name","properties":{
                "name":"EPSG:32640"
              }
            }
          }
      }
      ]
    }
    --batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f--`;

    odataServerFake.respondWith('POST', 'http://134.209.30.115:1818/odata/$batch',
      function (request) {
        request.respond(200, { 'content-type': 'multipart/mixed; boundary=batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f' },
        responseText);
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
  var done = assert.async(3);
  Ember.run(() => {
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

    component.get('_leafletLayerPromise').then((leafletLayer) => {
      component.set('_leafletObject', leafletLayer);

      component.loadLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Load with null featureIds');
        done();
      });
    }).finally(() => {
      done();
      getmapApiStub.restore();
      getPkFieldStub.restore();
    });

    assert.ok(component, 'Create odata-layer');
    done();
  });
});

test('getLayerFeatures() with featureIds=null', function(assert) {
  assert.expect(2);
  var done = assert.async(3);
  Ember.run(() => {
    let component = this.subject(param);

    let getCountFeaturesStub = sinon.stub(component, 'getCountFeatures');
    getCountFeaturesStub.returns(Ember.run(() => { return Ember.RSVP.resolve(123); }));

    let e = {
      featureIds: null,
      layer: 'f34ea73d-9f00-4f02-b02d-675d459c972b',
      results: Ember.A()
    };

    component.get('_leafletLayerPromise').then((leafletLayer) => {
      component.set('_leafletObject', leafletLayer);

      component.getLayerFeatures(e).then((layers) => {
        assert.ok(layers, 'Get with null featureIds');
        done();
      });
    }).finally(() => {
      done();
      getCountFeaturesStub.restore();
    });

    assert.ok(component, 'Create odata-layer');
    done();
  });
});

test('continueLoad()', function(assert) {
  assert.expect(7);
  var done = assert.async(3);

  Ember.run(() => {
    let component = this.subject(param);
    Ember.run(() => {
      component.get('_leafletLayerPromise').then((leafletLayer) => {
        component.set('_leafletObject', leafletLayer);
        leafletLayer.promiseLoadLayer.then(Ember.run(() => {
          let loadedBounds = component.get('loadedBounds');
          assert.ok(loadedBounds, 'loadedBounds');
          assert.ok(loadedBounds.getBounds() instanceof L.LatLngBounds, 'loadedBounds.getBounds() is L.LatLngBounds');
          assert.ok(JSON.stringify(loadedBounds.getBounds()) === JSON.stringify(bounds), 'loadedBounds get from map');

          bounds = L.latLngBounds(L.latLng(58.46807257997011, 56.61014556884766), L.latLng(58.443780224452524, 56.44535064697266));

          let load = component.continueLoad();
          load.then(Ember.run(() => {
            loadedBounds = component.get('loadedBounds');
            assert.ok(loadedBounds, 'loadedBounds');
            assert.ok(loadedBounds.getBounds() instanceof L.LatLngBounds, 'loadedBounds.getBounds() is L.LatLngBounds');
            let strBounds = '{"_southWest":{"lat":58.4436454695997,"lng":56.369991302490234},"_northEast":{"lat":58.46807257997011,"lng":56.61014556884766}}';
            assert.ok(JSON.stringify(loadedBounds.getBounds()) === strBounds, 'loadedBounds get from map');

            done();
          }));
        }));
      }).finally(() => {
        done();
      });
    });

    assert.ok(component, 'Create odata-layer');
    done();
  });
});

test('test methos identify()', function(assert) {
  assert.expect(3);
  var done = assert.async(1);
  Ember.run(() => {
    let latlngs = [
      [L.latLng(30, 10), L.latLng(40, 40), L.latLng(20, 40), L.latLng(10, 20)]
    ];
    let layer = L.polygon(latlngs);
    let e = {
      polygonLayer: layer
    };
    Ember.$.extend(param, {
      crs: crsFactory4326.create(),
      _getFeature() {
        return Ember.RSVP.resolve(['1']);
      },
      _addLayersOnMap() {
        null;
      }
    });
    let component = this.subject(param);
    let spyGetFeature = sinon.spy(component, '_getFeature');

    component.identify(e);

    assert.ok(spyGetFeature.getCall(0).args[0] instanceof Query.GeometryPredicate);
    assert.equal(spyGetFeature.getCall(0).args[0]._attributePath, 'shape');
    assert.equal(spyGetFeature.getCall(0).args[0]._intersectsValue,
      'SRID=4326;POLYGON((10 30, 40 40, 40 20, 20 10, 10 30))');
    done();
    spyGetFeature.restore();
  });
});
