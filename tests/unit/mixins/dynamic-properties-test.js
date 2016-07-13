import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import { module, test } from 'qunit';

module('Unit | Mixin | dynamic properties mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let DynamicPropertiesMixinObject = Ember.Object.extend(DynamicPropertiesMixin);
  let subject = DynamicPropertiesMixinObject.create();
  assert.ok(subject);
});
