import Ember from 'ember';
import FlexberryMapModelApiCosmosMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-cosmos';
import { module, test } from 'qunit';

module('Unit | Mixin | flexberry map model api cosmos');

// Replace this with your real tests.
test('it works', function(assert) {
  let FlexberryMapModelApiCosmosObject = Ember.Object.extend(FlexberryMapModelApiCosmosMixin);
  let subject = FlexberryMapModelApiCosmosObject.create();
  assert.ok(subject);
});
