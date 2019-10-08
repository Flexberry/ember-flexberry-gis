import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('map-tools/compare', 'Integration | Component | map tools/compare', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{map-tools/compare}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#map-tools/compare}}
      template block text
    {{/map-tools/compare}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
