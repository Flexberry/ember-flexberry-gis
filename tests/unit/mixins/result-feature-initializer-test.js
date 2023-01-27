import Ember from 'ember';
import ResultFeatureInitializerMixin from 'ember-flexberry-gis/mixins/result-feature-initializer';
import { module, test } from 'qunit';

module('Unit | Mixin | result feature initializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let ResultFeatureInitializerObject = Ember.Object.extend(ResultFeatureInitializerMixin);
  let subject = ResultFeatureInitializerObject.create();
  assert.ok(subject);
});
