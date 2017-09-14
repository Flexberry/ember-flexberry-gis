import Ember from 'ember';
import MapRouteMetadataIdsHandlerMixin from 'ember-flexberry-gis/mixins/map-route-metadata-ids-handler';
import { module, test } from 'qunit';

module('Unit | Mixin | map route metadata ids handler');

// Replace this with your real tests.
test('it works', function(assert) {
  let MapRouteMetadataIdsHandlerObject = Ember.Object.extend(MapRouteMetadataIdsHandlerMixin);
  let subject = MapRouteMetadataIdsHandlerObject.create();
  assert.ok(subject);
});
