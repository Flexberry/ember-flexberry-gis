import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | layers/group layer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('leafletContainer', L.layerGroup());

    await render(hbs`{{layers/group-layer leafletContainer=leafletContainer}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
