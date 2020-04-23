import Ember from 'ember';
import FlexberryMapModelApiVisualeditMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-visualedit';
import { module, test } from 'qunit';

module('Unit | Mixin | flexberry map model api visualedit');

// Replace this with your real tests.
test('it works', function(assert) {
  let FlexberryMapModelApiVisualeditObject = Ember.Object.extend(FlexberryMapModelApiVisualeditMixin);
  let subject = FlexberryMapModelApiVisualeditObject.create();
  assert.ok(subject);
});

test('one', function(assert) {
  assert.ok(true);
});
