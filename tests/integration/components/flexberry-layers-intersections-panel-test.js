import { moduleForComponent, test } from 'ember-qunit';

// import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-layers-intersections-panel', 'Integration | Component | flexberry layers intersections panel', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // this.render(hbs`{{flexberry-layers-intersections-panel}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  // this.render(hbs`
  //   {{#flexberry-layers-intersections-panel}}
  //     template block text
  //   {{/flexberry-layers-intersections-panel}}
  // `);

  // assert.equal(this.$().text().trim(), 'template block text');
});
