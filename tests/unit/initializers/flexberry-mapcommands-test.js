import Ember from 'ember';
import FlexberryMapcommandsInitializer from 'dummy/initializers/flexberry-mapcommands';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | flexberry mapcommands', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  FlexberryMapcommandsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
