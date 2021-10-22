import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | flexberry map', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(0);

    await render(hbs`{{flexberry-map}}`);

    // Template block usage:
    await render(hbs`
      {{#flexberry-map model=model}}
        template block text
      {{/flexberry-map}}
    `);
  });
});
