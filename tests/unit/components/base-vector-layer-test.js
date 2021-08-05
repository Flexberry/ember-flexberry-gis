import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from 'dummy/tests/helpers/start-app';

let app;

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
    }).finally(done);
  });
});
