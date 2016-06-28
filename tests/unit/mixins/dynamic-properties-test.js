import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import { module, test } from 'qunit';

module('Unit | Mixin | dymanic properties');

// Replace this with your real tests.
test('it works', function(assert) {
  let DymanicPropertiesObject = Ember.Object.extend(DynamicPropertiesMixin);
  let subject = DymanicPropertiesObject.create();
  assert.ok(subject);
});
