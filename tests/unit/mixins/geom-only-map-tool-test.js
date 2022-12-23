import Ember from 'ember';
import GeomOnlyMapToolMixin from 'ember-flexberry-gis/mixins/geom-only-map-tool';
import { module, test } from 'qunit';

module('Unit | Mixin | geom only map tool');

// Replace this with your real tests.
test('it works', function(assert) {
  let GeomOnlyMapToolObject = Ember.Object.extend(GeomOnlyMapToolMixin);
  let subject = GeomOnlyMapToolObject.create();
  assert.ok(subject);
});
