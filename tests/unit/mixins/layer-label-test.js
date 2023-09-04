import Ember from 'ember';
import LayerLabelMixin from 'ember-flexberry-gis/mixins/layer-label';
import { module, test } from 'qunit';

let LayerLabelObject = Ember.Object.extend(LayerLabelMixin);
module('Unit | Mixin | layer label');

test('it works', function(assert) {
  let subject = LayerLabelObject.create();
  assert.ok(subject);
});

