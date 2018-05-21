import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('base-vector-layer', 'Unit | Component | base-vector-layer', {
  unit: true,
});

test(`it identify on 'geojson' layer`, function(assert) {
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
    },
  });

  let select = function() {
    return {
      polygonLayer: {
        toGeoJSON: () => ({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: arguments },
        }),
      }
    };
  };

  assert.expect(3);
  let done = assert.async(3);
  component.identify(select([[4, 4], [2, 4], [2, 6], [4, 6]])).then((results) => {
    assert.equal(results.length, 0, 'Empty area is selected.');
  }).finally(done);

  component.identify(select([[9, 5], [8, 8], [6, 6]])).then((results) => {
    assert.equal(results.length, 3, 'Point (from FeatureCollection), MultiLineString and Polygon.');
  }).finally(done);

  component.identify(select([[9, 1], [1, 1], [1, 9], [9, 9]])).then((results) => {
    assert.equal(results.length, 9, 'All geometries is selected.');
  }).finally(done);
});
