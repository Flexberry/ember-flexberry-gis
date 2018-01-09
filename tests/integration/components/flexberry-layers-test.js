import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
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
  let geoJsonData = `
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
  let geoJson = L.geoJSON(JSON.parse(geoJsonData));
  this.set('items', Ember.A([{
    name: 'test layer',
    type: 'geojson',
    leafletObject: geoJson
  }]));
  this.set('leafletContainer', L.layerGroup());

  this.on('onLayerInit', ({ leafletObject, layerModel }) => {
    assert.ok(!Ember.isNone(leafletObject), 'leafletObject should not be null');
    assert.equal(Ember.get(layerModel, 'name'), 'test layer');
  });

  this.on('onLayerDestroy', ({ leafletObject, layerModel }) => {
    assert.ok(!Ember.isNone(leafletObject), 'leafletObject should not be null');
    assert.equal(Ember.get(layerModel, 'name'), 'test layer');
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
