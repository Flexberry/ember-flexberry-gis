import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | layers/group layer', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    const leafletMap = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });
    this.set('leafletMap', leafletMap);
    this.set('leafletContainer', L.layerGroup());

    this.render(hbs`{{layers/group-layer leafletContainer=leafletContainer leafletMap=leafletMap}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
