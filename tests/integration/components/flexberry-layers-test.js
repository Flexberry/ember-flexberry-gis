import { moduleForComponent, test } from 'ember-qunit';
import { get } from '@ember/object';
import { isNone } from '@ember/utils';
import { A } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-layers', 'Integration | Component | flexberry layers', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{flexberry-layers}}`);

  assert.equal(this.$().text().trim(), '');
});

test('layer component sends actions', function(assert) {
  const geoJsonData = `
    {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [102.0, 0.5]
        },
        "properties": {
          "prop0": "value0"
        }
      }
    ]
  }`;
  const geoJson = L.geoJSON(JSON.parse(geoJsonData));
  this.set('items', A([{
    name: 'test layer',
    type: 'geojson',
    leafletObject: geoJson
  }]));
  this.set('leafletContainer', L.layerGroup());

  this.on('onLayerInit', ({ leafletObject, layerModel }) => {
    assert.ok(!isNone(leafletObject), 'leafletObject should not be null');
    assert.equal(get(layerModel, 'name'), 'test layer');
  });

  this.on('onLayerDestroy', ({ leafletObject, layerModel }) => {
    assert.ok(!isNone(leafletObject), 'leafletObject should not be null');
    assert.equal(get(layerModel, 'name'), 'test layer');
  });

  this.render(hbs`
    {{flexberry-layers
      leafletContainer=leafletContainer
      layers=(get-with-dynamic-actions this "items"
        dynamicActions=(array
          (hash
            on="layerInit"
            actionName="onLayerInit"
          )
          (hash
            on="layerDestroy"
            actionName="onLayerDestroy"
          )
        )
      )}}`);
});
