import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('flexberry-identify-file', 'Unit | Component | flexberry identify file', {
  unit: true,
  needs: [
    'service:map-api',
    'service:i18n'
  ]
});

test('test createLayerMethod', function (assert) {
  let response = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'id': 'vodnyiobjektpoint32640.ed201773-3a7c-4c5e-97a9-63524f12885d',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            448559.297603457,
            6424330.67035587
          ]
        },
        'geometry_name': 'shape',
        'properties': {
          'primarykey': 'ed201773-3a7c-4c5e-97a9-63524f12885d',
          'naimenovanie': null,
          'tip': null,
          'dlina': null,
          'shirina': null,
          'createtime': null,
          'creator': 'user',
          'edittime': null,
          'editor': null
        }
      },
      {
        'type': 'Feature',
        'id': 'vodnyiobjektpoint32640.b6206860-0b1c-4f69-bdce-3d5ed31fb8c5',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            448559.297603457,
            6424330.67035587
          ]
        },
        'geometry_name': 'shape',
        'properties': {
          'primarykey': 'b6206860-0b1c-4f69-bdce-3d5ed31fb8c5',
          'naimenovanie': null,
          'tip': null,
          'dlina': null,
          'shirina': null,
          'createtime': null,
          'creator': 'user',
          'edittime': null,
          'editor': null
        }
      },
      {
        'type': 'Feature',
        'id': 'vodnyiobjektpoint32640.780291de-4b30-4b87-a8c0-285405df23f4',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            453932.314442248,
            6422913.65058862
          ]
        },
        'geometry_name': 'shape',
        'properties': {
          'primarykey': '780291de-4b30-4b87-a8c0-285405df23f4',
          'naimenovanie': null,
          'tip': null,
          'dlina': null,
          'shirina': null,
          'createtime': null,
          'creator': 'user',
          'edittime': null,
          'editor': null
        }
      }
    ],
    'totalFeatures': 3,
    'numberMatched': 3,
    'numberReturned': 3,
    'timeStamp': '2022-12-15T05:29:31.705Z',
    'crs': {
      'type': 'name',
      'properties': {
        'name': 'urn:ogc:def:crs:EPSG::32640'
      }
    }
  };

  let component = this.subject();
  let layer = component._createLayer(response, L.CRS.EPSG4326);
  assert.equal(layer.feature.crs.properties.name, 'EPSG:4326');
  assert.equal(layer.feature.geometry.type, 'MultiPoint');
  assert.equal(JSON.stringify(layer.feature.geometry.coordinates),
  JSON.stringify([[448559.297603457, 6424330.67035587], [453932.314442248, 6422913.65058862]]));
});
