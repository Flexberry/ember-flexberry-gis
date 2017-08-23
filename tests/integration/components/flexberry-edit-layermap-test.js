import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-edit-layermap', 'Integration | Component | flexberry edit layermap', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{flexberry-edit-layermap}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#flexberry-edit-layermap}}
      template block text
    {{/flexberry-edit-layermap}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
