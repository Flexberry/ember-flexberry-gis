import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers-dialogs/attributes/edit', 'Integration | Component | layers dialogs/attributes/edit', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{layers-dialogs/attributes/edit}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#layers-dialogs/attributes/edit}}
      template block text
    {{/layers-dialogs/attributes/edit}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
