import Ember from 'ember';
import MapLayersLoaderMixin from 'ember-flexberry-gis/mixins/map-layers-loader';
import { module, test } from 'qunit';

module('Unit | Mixin | map-layers-loader');

// Replace this with your real tests.
test('it works', function(assert) {
  let MapLayersLoaderObject = Ember.Object.extend(MapLayersLoaderMixin);
  let subject = MapLayersLoaderObject.create();
  assert.ok(subject);
});
