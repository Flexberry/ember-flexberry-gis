import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers-dialogs/settings/tile-vector', 'Integration | Component | layers dialogs/settings/tile vector', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{layers-dialogs/settings/tile-vector}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#layers-dialogs/settings/tile-vector}}
      template block text
    {{/layers-dialogs/settings/tile-vector}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
