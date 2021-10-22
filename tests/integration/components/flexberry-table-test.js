import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | flexberry table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('header', { name: 'gis-search-form.layer-metadata.header.name' });

    await render(hbs`{{flexberry-table header=header}}`);

    assert.notEqual(this.element.textContent.indexOf('No data'), -1, 'Should contain "No data"');

    // Template block usage:
    // this.render(hbs`
    //   {{#flexberry-table}}
    //     template block text
    //   {{/flexberry-table}}
    // `);

    // assert.equal(this.$().text().trim(), 'template block text');
  });
});
