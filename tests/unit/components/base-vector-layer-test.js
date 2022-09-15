import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from 'dummy/tests/helpers/start-app';

let app;
let leafletMap;
moduleForComponent('base-vector-layer', 'Unit | Component | base-vector-layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'component:base-vector-layer',
    'model:new-platform-flexberry-g-i-s-map'
  ],
  beforeEach: function() {
    app = startApp();
    leafletMap = L.map(document.createElement('div'));
  },
  afterEach: function() {
    Ember.run(app, 'destroy');
  }
});

test(`it identify on 'geojson' layer`, function(assert) {
  assert.expect(3);
  let done = assert.async(3);
  Ember.run(() => {
    /*
      9  . . . . . . . . .
      8 MPMP . .CpCp .MLML
      7 MP .MP . . . . . .
      6  .MPMP . P P .MLML
      5  . . . . P P . . .
      4  .CPCP . . . . L .
      3  . .CP . . . p . L
      2 CLCL . . . . . L .
      1 CL . .MpMp . . . .
      0  1 2 3 4 5 6 7 8 9
    */
    let component = this.subject({
      _createLayer() {
        this.set('_leafletObject', L.geoJson([
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3, 7] },
          },
          {
            type: 'Feature',
            geometry: { type: 'MultiPoint', coordinates: [[1, 4], [1, 5]] },
          },
          {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[2, 8], [3, 9], [4, 8]] },
          },
          {
            type: 'Feature',
            geometry: { type: 'MultiLineString', coordinates: [[[6, 8], [6, 9]], [[8, 8], [8, 9]]] },
          },
          {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[[5, 5], [5, 6], [6, 6], [6, 5]]] },
          },
          {
            type: 'Feature',
            geometry: { type: 'MultiPolygon', coordinates: [[[[7, 1], [8, 1], [8, 2]]], [[[6, 2], [6, 3], [7, 3]]]] },
          },
          {
            type: 'GeometryCollection',
            geometries: [
              { type: 'Polygon', coordinates: [[[3, 3], [4, 3], [4, 2]]] },
              { type: 'LineString', coordinates: [[1, 1], [2, 1], [2, 2]] },
            ],
          },
          {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Point', coordinates: [8, 5] } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [8, 6] } },
            ],
          },
        ]));
        this.set('_leafletObject.options', { crs: L.CRS.EPSG4326 });
      },
    });

    let select = function(ar) {
      return {
        polygonLayer: {
          toGeoJSON: () => ({
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: ar },
          }),
        }
      };
    };

    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.withArgs('mapModel').returns(mapModel);
    getmapApiStub.withArgs('precisionScale').returns(10000);

    component.identify(select([[[4, 4], [2, 4], [2, 6], [4, 6], [4, 4]]])).then((results) => {
      assert.equal(results.length, 0, 'Empty area is selected.');
    }).finally(done);

    component.identify(select([[[9, 5], [8, 8], [6, 6], [9, 5]]])).then((results) => {
      assert.equal(results.length, 3, 'Point (from FeatureCollection), MultiLineString and Polygon.');
    }).finally(done);

    component.identify(select([[[9, 1], [1, 1], [1, 9], [9, 9], [9, 1]]])).then((results) => {
      assert.equal(results.length, 10, 'All geometries is selected.');
    }).finally(() => {
      done();
      getmapApiStub.restore();
    });
  });
});
test('test getPkField with pkField', function (assert) {
  assert.expect(1);
  var done = assert.async(1);
  Ember.run(() => {
    let options = { pkField: 'pk' };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        return L.geoJson(
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3, 7] },
          }
        );
      },
      createReadFormat() {
        return null;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let fieldName = leafletObject.getPkField(component.get('layerModel'));
      assert.equal(fieldName, 'pk');
      done(1);
    });
  });
});
test('test getPkField without pkField', function (assert) {
  assert.expect(1);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {};
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        return L.geoJson(
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3, 7] },
          }
        );
      },
      createReadFormat() {
        return null;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let fieldName = leafletObject.getPkField(component.get('layerModel'));
      assert.equal(fieldName, 'primarykey');
      done(1);
    });
  });
});
test('test showAllLayerObjects with continueLoading: false and showExisting: false', function (assert) {
  assert.expect(5);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: false,
      showExisting: false
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        let layer = L.featureGroup([feature]);
        layer.options = options;
        feature.addTo(leafletMap);
        return layer;
      },
      createReadFormat() {
        return null;
      },
      loadLayerFeatures(e) {
        return new Ember.RSVP.Promise((resolve, reject) => {
          resolve(this.get('_leafletObject').addLayer(L.geoJson(
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [3, 7] },
            }
          )));
        });
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let clearLayersSpy = sinon.spy(leafletObject, 'clearLayers');
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');
      leafletObject.showAllLayerObjects().then((resule) => {
        assert.equal(resule, 'success');
        assert.equal(clearLayersSpy.callCount, 1);
        assert.equal(loadLayerFeaturesSpy.callCount, 1);
        assert.equal(removeLayerSpy.callCount, 1);
        assert.equal(addLayerSpy.callCount, 1);
        clearLayersSpy.restore();
        loadLayerFeaturesSpy.restore();
        removeLayerSpy.restore();
        addLayerSpy.restore();
        done(1);
      });
    });
  });
});
test('test showAllLayerObjects with continueLoading: false and showExisting: true', function (assert) {
  assert.expect(5);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: false,
      showExisting: true
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        let layer = L.featureGroup([feature]);
        layer.options = options;
        return layer;
      },
      createReadFormat() {
        return null;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let clearLayersSpy = sinon.spy(leafletObject, 'clearLayers');
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');
      leafletObject.showAllLayerObjects().then((resule) => {
        assert.equal(resule, 'success');
        assert.equal(clearLayersSpy.callCount, 0);
        assert.equal(loadLayerFeaturesSpy.callCount, 1);
        assert.equal(removeLayerSpy.callCount, 0);
        assert.equal(addLayerSpy.callCount, 1);
        clearLayersSpy.restore();
        loadLayerFeaturesSpy.restore();
        removeLayerSpy.restore();
        addLayerSpy.restore();
        done(1);
      });
    });
  });
});
test('test showAllLayerObjects with continueLoading: true and showExisting: false', function (assert) {
  assert.expect(7);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: true,
      showExisting: false,
      labelSettings: {
        signMapObjects: true
      }
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        let layer = L.featureGroup([feature]);
        layer.options = options;
        feature.addTo(leafletMap);

        let featureLabel = L.marker([50.5, 30.5]);
        let _labelsLayer = L.featureGroup([featureLabel]);
        layer._labelsLayer = _labelsLayer;
        _labelsLayer.addTo(leafletMap);
        return layer;
      },
      createReadFormat() {
        return null;
      },
      continueLoad(leafletObject) {
        let promiseLoadLayer = new Ember.RSVP.Promise((resolve) => {
          leafletObject.addLayer(L.marker([50.7, 30.7]));
          resolve(leafletObject);
        });
        leafletObject.promiseLoadLayer = promiseLoadLayer;
        return promiseLoadLayer;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let clearLayersSpy = sinon.spy(leafletObject, 'clearLayers');
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');
      let hasLayerSpy = sinon.spy(leafletMap, 'hasLayer');
      let continueLoadSpy = sinon.spy(component, 'continueLoad');
      leafletObject.showAllLayerObjects().then((resule) => {
        assert.equal(resule, 'success');
        assert.equal(clearLayersSpy.callCount, 0);
        assert.equal(loadLayerFeaturesSpy.callCount, 0);
        assert.equal(removeLayerSpy.callCount, 0);
        assert.equal(addLayerSpy.callCount, 2);
        assert.equal(continueLoadSpy.callCount, 1);
        assert.equal(hasLayerSpy.callCount, 4);
        clearLayersSpy.restore();
        loadLayerFeaturesSpy.restore();
        removeLayerSpy.restore();
        addLayerSpy.restore();
        continueLoadSpy.restore();
        hasLayerSpy.restore();
        done(1);
      });
    });
  });
});

test('test hideAllLayerObjects', function (assert) {
  assert.expect(3);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: true,
      showExisting: false,
      labelSettings: {
        signMapObjects: true
      }
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        let layer = L.featureGroup([feature]);
        layer.options = options;
        feature.addTo(leafletMap);
        let label = L.marker([50.5, 30.5]);
        let _labelsLayer = L.featureGroup([label]);
        layer._labelsLayer = _labelsLayer;
        _labelsLayer.addTo(leafletMap);
        label.addTo(leafletMap);
        return layer;
      },
      createReadFormat() {
        return null;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let eachLayerSpy = sinon.spy(leafletObject, 'eachLayer');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let hasLayerSpy = sinon.spy(leafletMap, 'hasLayer');
      leafletObject.hideAllLayerObjects();

      assert.equal(eachLayerSpy.callCount, 1);
      assert.equal(removeLayerSpy.callCount, 2);
      assert.equal(hasLayerSpy.callCount, 3);
      eachLayerSpy.restore();
      removeLayerSpy.restore();
      hasLayerSpy.restore();
      done(1);
    });
  });
});
test('test _setVisibilityObjects with showExisting=false and visibility = true', function (assert) {
  assert.expect(4);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: false,
      showExisting: false,
      labelSettings: {
        signMapObjects: true
      }
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        feature.id = '1';
        let layer = L.featureGroup([feature]);
        layer.options = options;
        let _labelsLayer = L.featureGroup([feature]);
        layer._labelsLayer = _labelsLayer;
        return layer;
      },
      createReadFormat() {
        return null;
      },
      mapApi: {
        getFromApi() {
          return {
            _getLayerFeatureId(layer, shape) { return shape.id; },
          };
        }
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');
      leafletObject._setVisibilityObjects(['1'], true).then((resule) => {
        assert.equal(resule, 'success');
        assert.equal(loadLayerFeaturesSpy.callCount, 1);
        assert.equal(removeLayerSpy.callCount, 0);
        assert.equal(addLayerSpy.callCount, 2);
        loadLayerFeaturesSpy.restore();
        removeLayerSpy.restore();
        addLayerSpy.restore();
        done(1);
      });
    });
  });
});
test('test _setVisibilityObjects with showExisting=false and visibility = false', function (assert) {
  assert.expect(4);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: false,
      showExisting: false,
      labelSettings: {
        signMapObjects: true
      }
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        feature.id = '1';
        let layer = L.featureGroup([feature]);
        feature.addTo(leafletMap);
        layer.options = options;
        let _labelsLayer = L.featureGroup([feature]);
        layer._labelsLayer = _labelsLayer;
        _labelsLayer.addTo(leafletMap);
        return layer;
      },
      createReadFormat() {
        return null;
      },
      mapApi: {
        getFromApi() {
          return {
            _getLayerFeatureId(layer, shape) { return shape.id; },
          };
        }
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');
      leafletObject._setVisibilityObjects(['1'], false).then((resule) => {
        assert.equal(resule, 'success');
        assert.equal(loadLayerFeaturesSpy.callCount, 0);
        assert.equal(removeLayerSpy.callCount, 2);
        assert.equal(addLayerSpy.callCount, 0);
        loadLayerFeaturesSpy.restore();
        removeLayerSpy.restore();
        addLayerSpy.restore();
        done(1);
      });
    });
  });
});
test('test _setVisibilityObjects with continueLoading=true and visibility = true', function (assert) {
  assert.expect(4);
  var done = assert.async(1);
  Ember.run(() => {
    let options = {
      continueLoading: true,
      showExisting: false
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature = L.marker([50.5, 30.5]);
        feature.id = '1';
        let layer = L.featureGroup([feature]);
        layer.options = options;
        return layer;
      },
      createReadFormat() {
        return null;
      },
      mapApi: {
        getFromApi() {
          return {
            _getLayerFeatureId(layer, shape) { return shape.id; },
          };
        }
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });

    component.get('_leafletLayerPromise').then((leafletObject) => {
      let loadLayerFeaturesSpy = sinon.spy(leafletObject, 'loadLayerFeatures');
      let removeLayerSpy = sinon.spy(leafletMap, 'removeLayer');
      let addLayerSpy = sinon.spy(leafletMap, 'addLayer');
      leafletObject._setVisibilityObjects(['1'], true).catch((error) => {
        assert.equal(error, 'Not working to layer with continueLoading');
        assert.equal(loadLayerFeaturesSpy.callCount, 0);
        assert.equal(removeLayerSpy.callCount, 0);
        assert.equal(addLayerSpy.callCount, 0);
        loadLayerFeaturesSpy.restore();
        removeLayerSpy.restore();
        addLayerSpy.restore();
        done(1);
      });
    });
  });
});
test('test getNearObject', function (assert) {
  assert.expect(8);
  var done = assert.async(2);
  Ember.run(() => {
    let options = {
      continueLoading: false,
      showExisting: true
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let feature1 =  L.polygon([[[[56.43419266, 58.15478571], [56.44148827, 58.155465], [56.44148827, 58.15274775], [56.43419266, 58.15478571]]]]);
        feature1.id = '1';
        feature1.feature = { properties: { primarykey: '1' } };
        let feature2 = L.polygon([[[[56.43419266, 59.15478571], [56.44148827, 59.155465], [56.44148827, 59.15274775], [56.43419266, 59.15478571]]]]);
        feature2.id = '2';
        feature2.feature = { properties: { primarykey: '2' } };
        let layer = L.featureGroup([feature1, feature2]);
        layer.options = options;
        return layer;
      },
      createReadFormat() {
        return null;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });
    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let _calcNearestObjectSpy = sinon.spy(component, '_calcNearestObject');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
        featureId: '234',
        layerObjectId: '123'
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result.distance, 18060435.745686203);
        assert.ok(result.layer);
        assert.equal(result.object.feature.properties.primarykey, '1');
        assert.equal(_calcNearestObjectSpy.callCount, 1);
        assert.equal(getObjectCenterSpy.callCount, 4);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 2);
        assert.equal(_getLayerFeatureIdSpy.callCount, 2);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        _calcNearestObjectSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});
test('test getNearObject Nearest object not found', function (assert) {
  assert.expect(6);
  var done = assert.async(2);
  Ember.run(() => {
    let options = {
      continueLoading: false,
      showExisting: true
    };
    let layerModel = Ember.Object.create({
      type: 'type',
      visibility: false,
      settingsAsObject:options
    });
    let component = this.subject({
      createVectorLayer() {
        let layer = L.featureGroup([]);
        layer.options = options;
        return layer;
      },
      createReadFormat() {
        return null;
      },
      layerModel: layerModel,
      leafletMap: leafletMap
    });
    let store = app.__container__.lookup('service:store');
    let mapModel = store.createRecord('new-platform-flexberry-g-i-s-map');
    let getmapApiStub = sinon.stub(component.get('mapApi'), 'getFromApi');
    getmapApiStub.returns(mapModel);

    let _calcNearestObjectSpy = sinon.spy(component, '_calcNearestObject');
    let getObjectCenterSpy = sinon.spy(mapModel, 'getObjectCenter');
    let _getDistanceBetweenObjectsSpy = sinon.spy(mapModel, '_getDistanceBetweenObjects');
    let _getLayerFeatureIdSpy = sinon.spy(mapModel, '_getLayerFeatureId');

    component.get('_leafletLayerPromise').then((leafletObject) => {
      component.set('_leafletObject', leafletObject);
      leafletObject.options = options;
      let featureLayer = L.polygon([[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]]);
      let e = {
        featureLayer: featureLayer,
        featureId: '234',
        layerObjectId: '123'
      };
      let promise = component.getNearObject(e).then((result) => {
        assert.equal(result, 'Nearest object not found');
        assert.equal(_calcNearestObjectSpy.callCount, 0);
        assert.equal(getObjectCenterSpy.callCount, 0);
        assert.equal(_getDistanceBetweenObjectsSpy.callCount, 0);
        assert.equal(_getLayerFeatureIdSpy.callCount, 0);
      }).finally(() => {
        done(1);
        getmapApiStub.restore();
        _calcNearestObjectSpy.restore();
        getObjectCenterSpy.restore();
        _getDistanceBetweenObjectsSpy.restore();
        _getLayerFeatureIdSpy.restore();
      });
      assert.ok(promise instanceof Ember.RSVP.Promise);
      done(1);
    });
  });
});

