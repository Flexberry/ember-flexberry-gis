import Ember from 'ember';
import CompareLayersMixin from 'ember-flexberry-gis/mixins/compare-layers';
import { module, test } from 'qunit';

module('Unit | Mixin | compare layers');

// Replace this with your real tests.
test('it works', function(assert) {
  let CompareLayersObject = Ember.Object.extend(CompareLayersMixin);
  let subject = CompareLayersObject.create();
  assert.ok(subject);
});
