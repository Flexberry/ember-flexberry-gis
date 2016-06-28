import Ember from 'ember';
import FlexberryLayerInitializer from 'dummy/initializers/flexberry-layer';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | flexberry layer', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  FlexberryLayerInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
