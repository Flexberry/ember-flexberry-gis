import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers-dialogs/tabs/labels-settings', 'Integration | Component | layers dialogs/tabs/labels settings', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{layers-dialogs/tabs/labels-settings}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#layers-dialogs/tabs/labels-settings}}
      template block text
    {{/layers-dialogs/tabs/labels-settings}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
