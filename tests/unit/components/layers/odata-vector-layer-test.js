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
let responseBatchUpdate;

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

    let hasLayer = function() {
      return true;
    };

    let removeLayer = function() {
      return {};
    };

    store = app.__container__.lookup('service:store');
    let layerModel = store.createRecord('test-model');
    layerModel.type = 'odata-vector';
    layerModel.visibility = true;
    Ember.$.extend(param, {
      'geometryType': 'MultiPolygonPropertyType',
      'modelName': 'test-model',
      'projectionName':'TestModelL',
      'geometryField': 'shape',
      'typeName': 'test-model',
      'odataClass': 'TestModel',
      'continueLoading': true,
      'store': store,
      'layerModel': layerModel,
      'leafletMap': {
        getBounds,
        getPane,
        createPane,
        hasLayer,
        removeLayer
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
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel(__PrimaryKey,ID,Name,Shape)","value":[
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
          "__PrimaryKey":"5b969764-acc2-4b48-8d6a-33b395c811ce", "Name":null,"Shape":{
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

    responseBatchUpdate = `--batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197
    Content-Type: multipart/mixed; boundary=changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0

    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    Content-ID: 1

    HTTP/1.1 204 No Content


    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    Content-ID: 2

    HTTP/1.1 200 OK
    Preference-Applied: return=representation
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                436033.67676677159,6495840.3180785989
              ],[
                436363.34399267368,6496168.5915842094
              ],[
                436698.1414727,6495894.2219982184
              ],[
                436423.43417282181,6495569.9820099371
              ],[
                436033.67676677159,6495840.3180785989
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":"test","__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a79b"
    }
    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    Content-ID: 3

    HTTP/1.1 201 Created
    Preference-Applied: return=representation
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                437417.96742371243,6495668.4535367191
              ],[
                437838.01481024339,6495726.4829143463
              ],[
                437685.16544237174,6495215.9105252894
              ],[
                437417.96742371243,6495668.4535367191
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":null,"__PrimaryKey":"a5532858-dbdc-4d3c-9eaf-3d71d097ceb0"
    }
    --changesetresponse_80ff11bf-cdeb-4dd0-9654-e316dc4bd7a0--
    --batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197
    Content-Type: application/http
    Content-Transfer-Encoding: binary

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                436033.676766772,6495840.3180786
              ],[
                436363.343992674,6496168.59158421
              ],[
                436698.1414727,6495894.22199822
              ],[
                436423.434172822,6495569.98200994
              ],[
                436033.676766772,6495840.3180786
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":"test","__PrimaryKey":"13681407-924d-4d2f-9c0d-f3059830a79b"
    }
    --batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197
    Content-Type: application/http
    Content-Transfer-Encoding: binary

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8; odata.metadata=minimal
    OData-Version: 4.0

    {
      "@odata.context":"http://dh.ics.perm.ru:8085/map/odata/$metadata#TestModel/$entity","Shape":{
        "type":"MultiPolygon","coordinates":[
          [
            [
              [
                437417.967423712,6495668.45353672
              ],[
                437838.014810243,6495726.48291435
              ],[
                437685.165442372,6495215.91052529
              ],[
                437417.967423712,6495668.45353672
              ]
            ]
          ]
        ],"crs":{
          "type":"name","properties":{
            "name":"EPSG:32640"
          }
        }
      },"Name":null,"__PrimaryKey":"a5532858-dbdc-4d3c-9eaf-3d71d097ceb0"
    }
    --batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197--`;

    odataServerFake.respondWith('POST', 'http://134.209.30.115:1818/odata/$batch',
      function (request) {
        if (request.requestBody.indexOf('POST') !== -1) {
          request.respond(200, { 'content-type': 'multipart/mixed; boundary=batchresponse_36948c8f-1a0a-46f7-b66d-6692dc185197' },
          responseBatchUpdate);
        } else {
          request.respond(200, { 'content-type': 'multipart/mixed; boundary=batchresponse_97a87974-3baf-4a2d-a8d4-bc7af540b74f' },
          responseText);
        }
      }
    );
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
    odataServerFake.restore();
  }
});

var jsonModel = {
  name: 'TestModel',
  modelName: 'test-model',
  className: 'TestModel',
  nameSpace: 'nm',
  parentModelName: null,
  parentClassName: null,
  attrs: [
    {
      name: 'shape',
      type: 'json',
      flexberryType: 'polygon32640',
      notNull: false,
      defaultValue: '',
      stored: true,
      ordered: false
    },
    {
      name: 'nomer',
      type: 'string',
      flexberryType: 'Строка250',
      notNull: false,
      defaultValue: '',
      stored: true,
      ordered: false
    }
  ],
  belongsTo: [],
  hasMany: [],
  projections: [
    {
      name: 'AuditView',
      modelName: 'test-model',
      attrs: [
        {
          name: 'shape',
          caption: '',
          hidden: false,
          index: 0
        },
        {
          name: 'nomer',
          caption: '',
          hidden: false,
          index: 1
        }
      ],
      belongsTo: [],
      hasMany: []
    },
    {
      name: 'TestModel_L',
      modelName: 'test-model',
      attrs: [
        {
          name: 'shape',
          caption: '',
          hidden: false,
          index: 0
        },
        {
          name: 'nomer',
          caption: '',
          hidden: false,
          index: 1
        }
      ],
      belongsTo: [],
      hasMany: []
    }
  ],
  stored: true,
  offline: true,
  external: false
};

let realCountArr = function (arr) {
  return arr.filter((item) => {
    if (item) {
      return item;
    }
  }).length;
};

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
        return null;
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

test('test method createAdapterForModel() with odataUrl', function(assert) {
  assert.expect(1);
  Ember.$.extend(param, {
    'odataUrl': 'http://localhost:6500/odata/'
  });
  let component = this.subject(param);

  let adapterModel = component.createAdapterForModel();

  assert.ok(adapterModel);
});

test('test method createAdapterForModel() without odataUrl', function(assert) {
  assert.expect(1);
  let component = this.subject(param);

  let adapterModel = component.createAdapterForModel();

  assert.notOk(adapterModel);
});

test('test method createDynamicModel() with json', function(assert) {
  assert.expect(19);
  var done = assert.async(1);
  Ember.$.extend(param, {
    'odataUrl': 'http://localhost:6500/odata/',
    'namespace': 'NS',
    'metadataUrl': 'assert/felxberry/models/'
  });
  jsonModel.parentModelName = null;
  let component = this.subject(param);
  let spyRegister = sinon.spy(Ember.getOwner(this), 'register');
  let spyCreateAdapterForModel = sinon.spy(component, 'createAdapterForModel');
  let spyCreateModel = sinon.spy(component, 'createModel');
  let spyCreateProjection = sinon.spy(component, 'createProjection');
  let spyCreateMixin = sinon.spy(component, 'createMixin');
  let spyCreateSerializer = sinon.spy(component, 'createSerializer');
  let spyCreateModelHierarchy = sinon.spy(component, 'сreateModelHierarchy');
  let stubAjax = sinon.stub(Ember.$, 'ajax');
  stubAjax.yieldsTo('success', jsonModel);
  let _lookupFactoryStub = sinon.stub(Ember.getOwner(this), '_lookupFactory');
  _lookupFactoryStub.returns(null);

  component.createDynamicModel().then(() => {
    assert.equal(spyCreateAdapterForModel.callCount, 1);
    assert.equal(spyCreateModel.callCount, 1);
    assert.equal(spyCreateProjection.callCount, 1);
    assert.equal(spyCreateMixin.callCount, 1);
    assert.equal(spyCreateSerializer.callCount, 1);

    assert.equal(spyRegister.callCount, 4);
    assert.equal(spyRegister.thirdCall.args[0], 'model:test-model');
    assert.ok(spyRegister.thirdCall.args[1].ClassMixin.mixins[1].properties.hasOwnProperty('namespace'));
    assert.equal(spyRegister.thirdCall.args[1].ClassMixin.mixins[1].properties.namespace, 'NS');
    assert.ok(spyRegister.thirdCall.args[1].ClassMixin.mixins[2].properties.projections.hasOwnProperty('TestModelL'));
    assert.equal(spyRegister.lastCall.args[0], 'mixin:test-model');
    assert.equal(Object.values(spyRegister.lastCall.args[1].mixins[0].properties).length, 2);
    assert.ok(spyRegister.lastCall.args[1].mixins[0].properties.hasOwnProperty('nomer'));
    assert.ok(spyRegister.lastCall.args[1].mixins[0].properties.hasOwnProperty('shape'));
    assert.equal(spyRegister.firstCall.args[0], 'serializer:test-model');
    assert.equal(spyRegister.secondCall.args[0], 'adapter:test-model');
    assert.ok(spyRegister.secondCall.args[1].PrototypeMixin.mixins[2].properties.hasOwnProperty('host'));
    assert.equal(spyRegister.secondCall.args[1].PrototypeMixin.mixins[2].properties.host, 'http://localhost:6500/odata/');

    assert.equal(spyCreateModelHierarchy.callCount, 1);

    done();
    spyRegister.restore();
    spyCreateAdapterForModel.restore();
    spyCreateModel.restore();
    spyCreateProjection.restore();
    spyCreateMixin.restore();
    spyCreateSerializer.restore();
    spyCreateModelHierarchy.restore();
    stubAjax.restore();
    _lookupFactoryStub.restore();
  });
});

test('test method createDynamicModel() with json with parent', function(assert) {
  assert.expect(22);
  var done = assert.async(1);
  Ember.$.extend(param, {
    'odataUrl': 'http://localhost:6500/odata/',
    'namespace': 'NS',
    'metadataUrl': 'assert/felxberry/models/'
  });

  let component = this.subject(param);
  let spyRegister = sinon.spy(Ember.getOwner(this), 'register');
  let spyCreateAdapterForModel = sinon.spy(component, 'createAdapterForModel');
  let spyCreateModel = sinon.spy(component, 'createModel');
  let spyCreateProjection = sinon.spy(component, 'createProjection');
  let spyCreateMixin = sinon.spy(component, 'createMixin');
  let spyCreateSerializer = sinon.spy(component, 'createSerializer');
  let spyCreateModelHierarchy = sinon.spy(component, 'сreateModelHierarchy');
  let _lookupFactoryStub = sinon.stub(Ember.getOwner(this), '_lookupFactory');
  _lookupFactoryStub.returns(null);

  jsonModel.parentModelName = 'Polygon32640';
  let parentJsonModel = {
    name: 'Polygon32640',
    modelName: 'Polygon32640',
    className: 'Polygon32640',
    nameSpace: 'NS1',
    parentModelName: null,
    parentClassName: null,
    attrs: [
      {
        name: 'name',
        type: 'string',
        flexberryType: 'Строка250',
        notNull: false,
        defaultValue: '',
        stored: true,
        ordered: false
      }
    ],
    belongsTo: [],
    hasMany: [],
    projections: [],
    stored: false,
    offline: true,
    external: false
  };

  let stubAjax = sinon.stub(Ember.$, 'ajax');
  stubAjax.onCall(0).yieldsTo('success', jsonModel)
    .onCall(1).yieldsTo('success', parentJsonModel);

  component.createDynamicModel().then(() => {
    assert.equal(spyCreateAdapterForModel.callCount, 1);
    assert.equal(spyCreateModel.callCount, 1);
    assert.equal(spyCreateProjection.callCount, 1);
    assert.equal(spyCreateMixin.callCount, 2);
    assert.equal(spyCreateSerializer.callCount, 1);
    assert.equal(stubAjax.callCount, 2);
    assert.equal(stubAjax.getCall(0).args[0].url, 'assert/felxberry/models/test-model.json');
    assert.equal(stubAjax.getCall(1).args[0].url, 'assert/felxberry/models/Polygon32640.json');

    assert.equal(spyRegister.callCount, 4);
    assert.equal(spyRegister.thirdCall.args[0], 'model:test-model');
    assert.ok(spyRegister.thirdCall.args[1].ClassMixin.mixins[1].properties.hasOwnProperty('namespace'));
    assert.equal(spyRegister.thirdCall.args[1].ClassMixin.mixins[1].properties.namespace, 'NS');
    assert.ok(spyRegister.thirdCall.args[1].ClassMixin.mixins[2].properties.projections.hasOwnProperty('TestModelL'));
    assert.equal(spyRegister.lastCall.args[0], 'mixin:test-model');
    assert.equal(Object.values(spyRegister.lastCall.args[1].mixins[0].properties).length, 2);
    assert.ok(spyRegister.lastCall.args[1].mixins[0].properties.hasOwnProperty('nomer'));
    assert.ok(spyRegister.lastCall.args[1].mixins[0].properties.hasOwnProperty('shape'));
    assert.equal(spyRegister.firstCall.args[0], 'serializer:test-model');
    assert.equal(spyRegister.secondCall.args[0], 'adapter:test-model');
    assert.ok(spyRegister.secondCall.args[1].PrototypeMixin.mixins[2].properties.hasOwnProperty('host'));
    assert.equal(spyRegister.secondCall.args[1].PrototypeMixin.mixins[2].properties.host, 'http://localhost:6500/odata/');

    assert.equal(spyCreateModelHierarchy.callCount, 2);

    done();
    spyRegister.restore();
    spyCreateAdapterForModel.restore();
    spyCreateModel.restore();
    spyCreateProjection.restore();
    spyCreateMixin.restore();
    spyCreateSerializer.restore();
    stubAjax.restore();
    spyCreateModelHierarchy.restore();
    _lookupFactoryStub.restore();
  });
});

test('test method createDynamicModel() without json', function(assert) {
  assert.expect(1);
  var done = assert.async(1);
  let component = this.subject(param);
  let _lookupFactoryStub = sinon.stub(Ember.getOwner(this), '_lookupFactory');
  _lookupFactoryStub.withArgs('model:test-model').returns(null);
  _lookupFactoryStub.withArgs('mixin:test-model').returns(null);
  _lookupFactoryStub.withArgs('serializer:test-model').returns({});

  let registerStub = sinon.stub(Ember.getOwner(this), 'register');
  registerStub.returns({});

  component.createDynamicModel().catch((error) => {
    assert.equal(error, 'Can\'t create dynamic model: test-model. Error: ModelName and metadataUrl is empty');
    done();
    _lookupFactoryStub.restore();
  });
});

test('test method createDynamicModel() already registered', function(assert) {
  assert.expect(1);
  var done = assert.async(1);
  let component = this.subject(param);
  let _lookupFactoryStub = sinon.stub(Ember.getOwner(this), '_lookupFactory');
  _lookupFactoryStub.returns(1);

  component.createDynamicModel().then((msg) => {
    assert.equal(msg, 'Model already registered: test-model');
    done();
    _lookupFactoryStub.restore();
  });
});

test('test method _createVectorLayer()', function(assert) {
  assert.expect(3);
  param.layerModel.visibility = false;
  let component = this.subject(param);
  let spyContinueLoad = sinon.spy(component, 'continueLoad');

  let layerResult = component._createVectorLayer();

  assert.ok(layerResult);
  assert.equal(spyContinueLoad.callCount, 1);
  assert.equal(spyContinueLoad.getCall(0).args[0], layerResult);

  spyContinueLoad.restore();
});

test('test method createVectorLayer() without dynamicModel', function(assert) {
  assert.expect(7);
  var done = assert.async(1);
  param.layerModel.visibility = false;
  let component = this.subject(param);
  let spyContinueLoad = sinon.spy(component, 'continueLoad');
  let _createVectorLayerSpy = sinon.spy(component, '_createVectorLayer');
  let spyCreateDynamicModel = sinon.spy(component, 'createDynamicModel');
  let spyAjax = sinon.spy(Ember.$, 'ajax');
  let spyCreateModelHierarchy = sinon.spy(component, 'сreateModelHierarchy');

  let _lookupFactoryStub = sinon.stub(Ember.getOwner(this), '_lookupFactory');
  _lookupFactoryStub.withArgs('model:test-model').returns(null);
  _lookupFactoryStub.withArgs('mixin:test-model').returns(null);
  _lookupFactoryStub.withArgs('serializer:test-model').returns({});

  let registerStub = sinon.stub(Ember.getOwner(this), 'register');
  registerStub.returns({});

  component.createVectorLayer().then((layer) => {
    assert.ok(layer);
    assert.equal(spyContinueLoad.callCount, 1);
    assert.equal(spyContinueLoad.getCall(0).args[0], layer);
    assert.equal(_createVectorLayerSpy.callCount, 1);
    assert.equal(spyAjax.callCount, 0);
    assert.equal(spyCreateDynamicModel.callCount, 0);
    assert.equal(spyCreateModelHierarchy.callCount, 0);
    done();
    spyContinueLoad.restore();
    _createVectorLayerSpy.restore();
    spyAjax.restore();
    spyCreateDynamicModel.restore();
    spyCreateModelHierarchy.restore();
    _lookupFactoryStub.restore();
    registerStub.restore();
  });
});

test('test method createVectorLayer() with dynamicModel=true', function(assert) {
  assert.expect(8);
  var done = assert.async(1);
  param.layerModel.visibility = false;
  param.dynamicModel = true;
  param.metadataUrl = 'assert/felxberry/models/';
  param.odataUrl = 'http://localhost:6500/odata/';
  jsonModel.parentModelName = null;
  let component = this.subject(param);
  let spyContinueLoad = sinon.spy(component, 'continueLoad');
  let _createVectorLayerSpy = sinon.spy(component, '_createVectorLayer');
  let spyCreateDynamicModel = sinon.spy(component, 'createDynamicModel');
  let stubAjax = sinon.stub(Ember.$, 'ajax');
  stubAjax.yieldsTo('success', jsonModel);
  let spyCreateModelHierarchy = sinon.spy(component, 'сreateModelHierarchy');

  let _lookupFactoryStub = sinon.stub(Ember.getOwner(this), '_lookupFactory');
  _lookupFactoryStub.withArgs('model:test-model').returns(null);
  _lookupFactoryStub.withArgs('mixin:test-model').returns(null);
  _lookupFactoryStub.withArgs('serializer:test-model').returns({});

  let registerStub = sinon.stub(Ember.getOwner(this), 'register');
  registerStub.returns({});

  component.createVectorLayer().then((layer) => {
    assert.ok(layer);
    assert.equal(spyContinueLoad.callCount, 2);
    assert.equal(spyContinueLoad.getCall(1).args[0], layer);
    assert.equal(_createVectorLayerSpy.callCount, 2);
    assert.equal(stubAjax.callCount, 1);
    assert.equal(stubAjax.getCall(0).args[0].url, 'assert/felxberry/models/test-model.json');
    assert.equal(spyCreateDynamicModel.callCount, 1);
    assert.equal(spyCreateModelHierarchy.callCount, 1);
    done();
    spyContinueLoad.restore();
    _createVectorLayerSpy.restore();
    spyCreateDynamicModel.restore();
    stubAjax.restore();
    spyCreateModelHierarchy.restore();
    _lookupFactoryStub.restore();
    registerStub.restore();
  });
});

test('test method save() no modified objects', function(assert) {
  assert.expect(5);
  var done = assert.async(1);
  let component = this.subject(param);

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    component.set('_leafletObject', leafletLayer);
    leafletLayer.promiseLoadLayer.then(() => {
      let leafletObject = component.get('_leafletObject');
      let obj = component.get('_adapterStoreModelProjectionGeom');
      let spyBatchUpdate = sinon.spy(obj.adapter, 'batchUpdate');

      assert.equal(realCountArr(leafletObject.models), 0);
      assert.equal(leafletObject.getLayers().length, 2);

      component.save();

      assert.equal(realCountArr(leafletObject.models), 0);
      assert.equal(leafletObject.getLayers().length, 2);
      assert.equal(spyBatchUpdate.callCount, 0);
      done();

      spyBatchUpdate.restore();
    });
  });
});

test('test method save() with objects', function(assert) {
  assert.expect(15);
  var done = assert.async(1);
  let component = this.subject(param);

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    component.set('_leafletObject', leafletLayer);
    leafletLayer.promiseLoadLayer.then(() => {
      let leafletObject = component.get('_leafletObject');
      let obj = component.get('_adapterStoreModelProjectionGeom');
      let spyBatchUpdate = sinon.spy(obj.adapter, 'batchUpdate');

      assert.equal(realCountArr(leafletObject.models), 0);
      assert.equal(leafletObject.getLayers().length, 2);

      let layerUpdate = leafletObject.getLayers()[0];
      layerUpdate.feature.properties.name = 'test';
      leafletObject.editLayer(layerUpdate);

      assert.equal(realCountArr(leafletObject.models), 1);
      assert.equal(leafletObject.getLayers().length, 2);

      let layerRemove = leafletObject.getLayers()[1];
      leafletObject.removeLayer(layerRemove);

      assert.equal(realCountArr(leafletObject.models), 2);
      assert.equal(leafletObject.getLayers().length, 1);

      let feature = {
        type: 'Polygon',
        coordinates: [
          [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
        ]
      };
      let layerAdd = L.geoJSON(feature).getLayers()[0];
      layerAdd._label = {
        _leaflet_id: 1000
      };
      leafletObject.addLayer(layerAdd);
      leafletObject._labelsLayer = {
        1000: {}
      };
      let pk = layerAdd.feature.properties.primarykey;
      responseBatchUpdate.replace('a5532858-dbdc-4d3c-9eaf-3d71d097ceb0', pk);

      assert.equal(realCountArr(leafletObject.models), 3);
      assert.equal(leafletObject.getLayers().length, 2);

      let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
      let stubGetmapApi = sinon.stub(component.get('mapApi'), 'getFromApi');
      stubGetmapApi.returns(mapModel);

      let _getModelLayerFeatureStub = sinon.stub(mapModel, '_getModelLayerFeature');
      _getModelLayerFeatureStub.returns(Ember.RSVP.resolve([null, null, [layerAdd]]));

      const saveSuccess = (data) => {
        assert.equal(_getModelLayerFeatureStub.callCount, 1);
        assert.deepEqual(_getModelLayerFeatureStub.getCall(0).args[1], [pk]);
        assert.equal(data.layers.length, 1);
        assert.equal(realCountArr(leafletObject.models), 0);
        assert.equal(leafletObject.getLayers().length, 1);
        assert.equal(leafletObject.getLayers()[0].state, 'exist');
        done();

        spyBatchUpdate.restore();
        stubGetmapApi.restore();
        _getModelLayerFeatureStub.restore();
      };

      leafletObject.once('save:success', saveSuccess);
      component.save();

      assert.equal(spyBatchUpdate.callCount, 1);
    });
  });
});

test('test method createModelHierarchy() with 3 parent', function(assert) {
  assert.expect(11);
  var done = assert.async(1);
  Ember.$.extend(param, {
    'odataUrl': 'http://localhost:6500/odata/',
    'namespace': 'ns',
    'metadataUrl': 'assert/felxberry/models/'
  });

  let component = this.subject(param);

  jsonModel.parentModelName = 'parent1';
  let parent1JsonModel = {
    name: 'parent1',
    parentModelName: 'parent2',
    modelName: 'parent1',
    className: 'parent1',
    nameSpace: 'NS1',
    attrs: [
      {
        name: 'name',
        type: 'string',
        flexberryType: 'Строка250',
        notNull: false,
        defaultValue: '',
        stored: true,
        ordered: false
      }
    ],
    belongsTo: [],
    hasMany: [],
    projections: [],
    stored: false,
    offline: true,
    external: false
  };

  let parent2JsonModel = {
    name: 'parent2',
    parentModelName: 'parent3',
    modelName: 'parent2',
    className: 'parent2',
    nameSpace: 'NS2',
    attrs: [
      {
        name: 'name2',
        type: 'string',
        flexberryType: 'Строка250',
        notNull: false,
        defaultValue: '',
        stored: true,
        ordered: false
      }
    ],
    belongsTo: [],
    hasMany: [],
    projections: [],
    stored: false,
    offline: true,
    external: false
  };

  let parent3JsonModel = {
    name: 'parent3',
    parentModelName: null,
    modelName: 'parent3',
    className: 'parent3',
    nameSpace: 'NS3',
    attrs: [
      {
        name: 'name3',
        type: 'string',
        flexberryType: 'Строка250',
        notNull: false,
        defaultValue: '',
        stored: true,
        ordered: false
      }
    ],
    belongsTo: [],
    hasMany: [],
    projections: [],
    stored: false,
    offline: true,
    external: false
  };
  let stubAjax = sinon.stub(Ember.$, 'ajax');
  stubAjax.onCall(0).yieldsTo('success', jsonModel)
    .onCall(1).yieldsTo('success', parent1JsonModel)
    .onCall(2).yieldsTo('success', parent2JsonModel)
    .onCall(3).yieldsTo('success', parent3JsonModel);

  let spyCreateModel = sinon.spy(component, 'createModel');
  let spyCreateMixin = sinon.spy(component, 'createMixin');
  let spyCreateModelHierarchy = sinon.spy(component, 'сreateModelHierarchy');

  component.сreateModelHierarchy(param.metadataUrl, param.modelName).then(({ model, dataModel, modelMixin }) => {
    assert.equal(stubAjax.callCount, 4);
    assert.equal(spyCreateModel.callCount, 1);
    assert.equal(spyCreateMixin.callCount, 4);
    assert.equal(spyCreateModelHierarchy.callCount, 4);
    assert.equal(spyCreateModelHierarchy.getCall(0).args[1], 'test-model');
    assert.equal(spyCreateModelHierarchy.getCall(1).args[1], 'parent1');
    assert.equal(spyCreateModelHierarchy.getCall(2).args[1], 'parent2');
    assert.equal(spyCreateModelHierarchy.getCall(3).args[1], 'parent3');
    assert.ok(model);
    assert.ok(dataModel);
    assert.ok(modelMixin);
    done();
    stubAjax.restore();
    spyCreateModel.restore();
    spyCreateMixin.restore();
    spyCreateModelHierarchy.restore();
  });
});

test('test method clearLayers()', function(assert) {
  assert.expect(4);
  var done = assert.async(1);
  let component = this.subject(param);

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    component.set('_leafletObject', leafletLayer);
    leafletLayer.promiseLoadLayer.then(() => {
      let leafletObject = component.get('_leafletObject');

      assert.equal(realCountArr(leafletObject.models), 0);
      assert.equal(leafletObject.getLayers().length, 2);
      leafletObject.clearLayers();
      assert.equal(realCountArr(leafletObject.models), 0);
      assert.equal(leafletObject.getLayers().length, 0);
      done();
    });
  });
});
