import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('flexberry-map', 'Integration | Component | flexberry map', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);

  this.set('model', Ember.Object.create());

  this.render(hbs`{{flexberry-map model=model}}`);

  // Template block usage:
  this.render(hbs`
    {{#flexberry-map model=model}}
      template block text
    {{/flexberry-map}}
  `);
});
