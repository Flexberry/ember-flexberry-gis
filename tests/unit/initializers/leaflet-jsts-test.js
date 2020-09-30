import Ember from 'ember';
import LeafletJstsInitializer from 'dummy/initializers/leaflet-jsts';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | leaflet jsts', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LeafletJstsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
