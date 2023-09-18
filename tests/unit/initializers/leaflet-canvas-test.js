import Ember from 'ember';
import LeafletCanvasInitializer from 'dummy/initializers/leaflet-canvas';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | leaflet canvas', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LeafletCanvasInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
