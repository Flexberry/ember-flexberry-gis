import Ember from 'ember';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import { module, test } from 'qunit';

module('Unit | Mixin | leaflet options');

// Replace this with your real tests.
test('it works', function(assert) {
  let LeafletOptionsObject = Ember.Object.extend(LeafletOptionsMixin);
  let subject = LeafletOptionsObject.create();
  assert.ok(subject);
});
