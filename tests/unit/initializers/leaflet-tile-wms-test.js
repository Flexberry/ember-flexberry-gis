import Ember from 'ember';
import LeafletTileWmsInitializer from 'dummy/initializers/leaflet-tile-wms';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | leaflet tile wms', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LeafletTileWmsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
