import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | flexberry map model api test');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

// Replace this with your real tests.
test('it works FlexberryMapModelApiMixin', function (assert) {
  let subject = mapApiMixinObject.create();
  assert.ok(subject);
});
