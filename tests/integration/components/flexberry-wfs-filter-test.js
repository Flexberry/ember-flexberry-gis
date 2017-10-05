import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-wfs-filter', 'Integration | Component | flexberry wfs filter', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{flexberry-wfs-filter}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#flexberry-wfs-filter}}
      template block text
    {{/flexberry-wfs-filter}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
