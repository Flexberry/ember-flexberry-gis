import Ember from 'ember';
import FlexberryMapModelApiCosmosMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-cosmos';
import { moduleFor, test } from 'ember-qunit';
import DS from 'ember-data';
import startApp from 'dummy/tests/helpers/start-app';
import { Query, Projection } from 'ember-flexberry-data';
import sinon from 'sinon';
import { Serializer } from 'ember-flexberry-data';

let app;
let odataServerFake;
let bounds;
let store;

moduleFor('flexberry-map-model-api-cosmos', 'Unit | Mixin | flexberry map model api cosmos', {
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

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiCosmosMixin);

// Replace this with your real tests.
test('test method findCosmos for feature', function(assert) {
  //Arrange
  let feature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates:[
        [[53.8349576870557,56.3315873558984],[53.7665178890887,57.13645345537],[55.2893925043467,57.1664744054687],
        [55.3256528620248,56.3607070521691],[53.8349576870557,56.3315873558984]]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  }
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.findCosmos(feature, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});
