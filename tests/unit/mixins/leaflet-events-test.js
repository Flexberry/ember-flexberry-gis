import Ember from 'ember';
import LeafletEventsMixin from 'ember-flexberry-gis/mixins/leaflet-events';
import { module, test } from 'qunit';

module('Unit | Mixin | leaflet events');

// Replace this with your real tests.
test('it works', function(assert) {
  let LeafletEventsObject = Ember.Object.extend(LeafletEventsMixin);
  let subject = LeafletEventsObject.create();
  assert.ok(subject);
});
