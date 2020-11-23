import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers/tile-vector-layer', 'Integration | Component | layers/tile vector layer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{layers/tile-vector-layer}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#layers/tile-vector-layer}}
      template block text
    {{/layers/tile-vector-layer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
