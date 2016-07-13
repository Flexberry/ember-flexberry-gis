import Ember from 'ember';
import LeafletRequiredOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-required-options';
import { module, test } from 'qunit';

module('Unit | Mixin | leaflet required options');

// Replace this with your real tests.
test('it works', function(assert) {
  let LeafletRequiredOptionsObject = Ember.Object.extend(LeafletRequiredOptionsMixin);
  let subject = LeafletRequiredOptionsObject.create();
  assert.ok(subject);
});
