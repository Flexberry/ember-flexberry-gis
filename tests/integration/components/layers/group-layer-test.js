import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers/group-layer', 'Integration | Component | layers/group layer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('container', L.layerGroup());

  this.render(hbs`{{layers/group-layer container=container}}`);

  assert.equal(this.$().text().trim(), '');
});
