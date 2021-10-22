import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import '@ember/test-helpers';

// import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | flexberry layers intersections panel', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // this.render(hbs`{{flexberry-layers-intersections-panel}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    // this.render(hbs`
    //   {{#flexberry-layers-intersections-panel}}
    //     template block text
    //   {{/flexberry-layers-intersections-panel}}
    // `);

    // assert.equal(this.$().text().trim(), 'template block text');
  });
});
