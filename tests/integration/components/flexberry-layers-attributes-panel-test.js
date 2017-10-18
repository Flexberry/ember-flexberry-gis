import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-layers-attributes-panel', 'Integration | Component | flexberry layers attributes panel', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{flexberry-layers-attributes-panel}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#flexberry-layers-attributes-panel}}
      template block text
    {{/flexberry-layers-attributes-panel}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
