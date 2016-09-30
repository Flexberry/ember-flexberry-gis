import Ember from 'ember';
import FlexberryMapCommandsInitializer from 'dummy/initializers/map-commands';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | map-commands', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  FlexberryMapCommandsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
