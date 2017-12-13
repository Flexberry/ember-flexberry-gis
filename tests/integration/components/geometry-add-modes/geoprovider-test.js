import { moduleForComponent, test } from 'ember-qunit';

// import hbs from 'htmlbars-inline-precompile';

moduleForComponent('geometry-add-modes/geoprovider', 'Integration | Component | geometry add modes/geoprovider', {
  integration: true
});

test('empty test', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // this.render(hbs`{{geometry-add-modes/geoprovider}}`);

  // assert.equal(this.$().text().trim(), '');

  assert.equal('', '');

  // Template block usage:
  // this.render(hbs`
  //   {{#geometry-add-modes/geoprovider}}
  //     template block text
  //   {{/geometry-add-modes/geoprovider}}
  // `);

  // assert.equal(this.$().text().trim(), 'template block text');
});
