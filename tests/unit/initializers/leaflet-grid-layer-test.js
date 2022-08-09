import Ember from 'ember';
import LeafletGridLayerInitializer from 'dummy/initializers/leaflet-grid-layer';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | leaflet grid layer', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LeafletGridLayerInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
