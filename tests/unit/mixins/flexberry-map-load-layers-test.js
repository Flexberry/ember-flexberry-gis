import Ember from 'ember';
import FlexberryMapLoadLayersMixin from 'ember-flexberry-gis/mixins/flexberry-map-load-layers';
import { module, test } from 'qunit';

module('Unit | Mixin | flexberry map load layers');

// Replace this with your real tests.
test('it works', function(assert) {
  let FlexberryMapLoadLayersObject = Ember.Object.extend(FlexberryMapLoadLayersMixin);
  let subject = FlexberryMapLoadLayersObject.create();
  assert.ok(subject);
});
