import { moduleForComponent, test } from 'ember-qunit';
import startApp from 'dummy/tests/helpers/start-app';

let store;
let options;
moduleForComponent('layers/combine-layer', 'Unit | Component | layers/combine layer', {
  unit: true,
  /*needs: [
    'service:map-api',
    'config:environment',
    'component:base-vector-layer',
    'model:new-platform-flexberry-g-i-s-map'
  ],*/
  beforeEach: function () {
    app = startApp();
    let leafletMap = L.map(document.createElement('div'));
    store = app.__container__.lookup('service:store');
    let layerModel = store.createRecord('test-model');
    layerModel.type = 'combine';
    layerModel.visibility = true;
    /*options = {
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      continueLoading: true
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
      'leafletMap': leafletMap
    });*/
    options = {
      'layerModel': layerModel,
      'leafletMap': leafletMap
    }
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
  }
});

test('test method createAllLayer', function(assert) {
  let component = this.subject(options);
  let componentLayer = component.createAllLayer();
  assert.ok(componentLayer instanceof L.TileLayer.WMS, 'Expected L.TileLayer.wms instance');
});
