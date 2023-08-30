import Ember from 'ember';
import LayerLabelMixin from 'ember-flexberry-gis/mixins/layer-label';
import { module, test } from 'qunit';

module('Unit | Mixin | layer label');

// Replace this with your real tests.
test('it works', function(assert) {
  let LayerLabelObject = Ember.Object.extend(LayerLabelMixin);
  let subject = LayerLabelObject.create();
  assert.ok(subject);
});
