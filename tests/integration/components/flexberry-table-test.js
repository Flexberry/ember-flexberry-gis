import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-table', 'Integration | Component | flexberry table', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('header', { name: 'gis-search-form.layer-metadata.header.name' });

  this.render(hbs`{{flexberry-table header=header}}`);

  assert.notEqual(this.$().text().indexOf('No data'), -1, 'Should contain "No data"');

  // Template block usage:
  // this.render(hbs`
  //   {{#flexberry-table}}
  //     template block text
  //   {{/flexberry-table}}
  // `);

  // assert.equal(this.$().text().trim(), 'template block text');
});
