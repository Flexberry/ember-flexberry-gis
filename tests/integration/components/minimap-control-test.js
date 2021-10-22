import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | minimap control', function (hooks) {
  setupRenderingTest(hooks);

  test('template return L.layerGroup', async function (assert) {
    assert.expect(1);

    this.set('layerGroupClass', L.LayerGroup);

    await render(hbs`
      {{#minimap-control as |layerG|}}
         <div class="layerG-body" is-layergroup="{{instance-of layerG layerGroupClass}}"></div>
      {{/minimap-control}}
    `);

    assert.ok(find('div.layerG-body').getAttribute('is-layergroup'));
  });
});
