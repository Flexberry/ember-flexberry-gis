import Ember from 'ember';
import FlexberryMapModelApiSavelayerMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-savelayer';
import { module, test } from 'qunit';

module('Unit | Mixin | flexberry map model api savelayer');

// Replace this with your real tests.
test('it works', function(assert) {
  let FlexberryMapModelApiSavelayerObject = Ember.Object.extend(FlexberryMapModelApiSavelayerMixin);
  let subject = FlexberryMapModelApiSavelayerObject.create();
  assert.ok(subject);
});
