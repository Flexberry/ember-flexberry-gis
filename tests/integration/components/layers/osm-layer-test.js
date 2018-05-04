import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers/osm-layer', 'Integration | Component | layers/osm layer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{layers/osm-layer}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#layers/osm-layer}}
      template block text
    {{/layers/osm-layer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
