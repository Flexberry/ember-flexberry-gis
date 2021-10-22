import { get } from '@ember/object';
import { isNone } from '@ember/utils';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | flexberry layers', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{flexberry-layers}}`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('layer component sends actions', async function(assert) {
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
    this.set('items', A([{
      name: 'test layer',
      type: 'geojson',
      leafletObject: geoJson
    }]));
    this.set('leafletContainer', L.layerGroup());

    this.actions.onLayerInit = ({ leafletObject, layerModel }) => {
      assert.ok(!isNone(leafletObject), 'leafletObject should not be null');
      assert.equal(get(layerModel, 'name'), 'test layer');
    };

    this.actions.onLayerDestroy = ({ leafletObject, layerModel }) => {
      assert.ok(!isNone(leafletObject), 'leafletObject should not be null');
      assert.equal(get(layerModel, 'name'), 'test layer');
    };

    await render(hbs`
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
});
