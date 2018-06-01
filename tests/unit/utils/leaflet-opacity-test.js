import { setLeafletLayerOpacity, maxGeometryOpacity } from 'dummy/utils/leaflet-opacity';
import { module, test } from 'qunit';

module('Unit | Util | Leaflet-opacity');

test('it works', function(assert) {

  assert.expect(6);

  let color = '#abcdef';
  let opacity = 0.42;

  let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', { foo: 'bar' });
  tileLayer.options.color = color;
  setLeafletLayerOpacity({ leafletLayer: tileLayer, opacity });
  assert.deepEqual([tileLayer.options.color, tileLayer.options.opacity], [color, opacity], 'Tile layer style kept and set');

  let featureGroup = L.featureGroup([L.marker([50, 30]), L.polygon([[3, -10], [4, -10], [4, -11], [3, -11]])]);
  featureGroup.eachLayer(function(l) {
    l.options.color = color;
  });
  setLeafletLayerOpacity({ leafletLayer: featureGroup, opacity });
  let fgGeometries = featureGroup.getLayers();
  assert.deepEqual([fgGeometries[0].options.color, fgGeometries[0].options.opacity], [color, opacity], 'Marker style in featureGroup kept and set');
  assert.deepEqual([fgGeometries[1].options.color, fgGeometries[1].options.opacity], [color, opacity],
    'Polygon style in featureGroup kept and set');

  let markerGroup = L.markerClusterGroup();
  markerGroup.addLayers([L.marker([0, 1]), L.marker([2, 3])]);
  markerGroup.eachLayer(function(l) {
    l.options.color = color;
  });
  setLeafletLayerOpacity({ leafletLayer: markerGroup, opacity });
  let markers = markerGroup.getLayers();
  assert.deepEqual([markers[1].options.color, markers[1].options.opacity], [color, opacity], 'Marker style in markerCluster kept and set');

  let data =
  { 'type': 'FeatureCollection',
    'features': [
      { 'type': 'Feature',
      'geometry': {
        'type': 'Point', 'coordinates': [2, 3] },
      },
      { 'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[10, 0], [11, 0], [11, 1], [10, 1], [10, 0]]]
      } }
    ]
  };

  let geojson = L.geoJSON(data, {
    style: function (feature) {
      return { color: color };
    } }
  );

  geojson.eachLayer(function(l) {
    l.options.color = color;
  });
  setLeafletLayerOpacity({ leafletLayer: geojson, opacity });
  let geometries = geojson.getLayers();
  assert.deepEqual([geometries[0].options.color, geometries[0].options.opacity], [color, opacity], 'feature Point style in geoJOSN kept and set');
  assert.deepEqual([geometries[1].options.color, geometries[1].options.opacity], [color, opacity * maxGeometryOpacity],
    'feature Polygon style in geoJOSN kept and set');
});
