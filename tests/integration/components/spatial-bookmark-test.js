import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('spatial-bookmark', 'Integration | Component | space bookmark', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{spatial-bookmark}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#spatial-bookmark}}
      template block text
    {{/spatial-bookmark}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
