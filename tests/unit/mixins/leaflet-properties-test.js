import Ember from 'ember';
import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';
import { module, test } from 'qunit';

module('Unit | Mixin | leaflet properties');

// Replace this with your real tests.
test('it works', function(assert) {
  let LeafletPropertiesObject = Ember.Object.extend(LeafletPropertiesMixin);
  let subject = LeafletPropertiesObject.create();
  assert.ok(subject);
});
