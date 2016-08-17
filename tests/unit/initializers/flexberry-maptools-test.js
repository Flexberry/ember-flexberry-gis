import Ember from 'ember';
import FlexberryMaptoolsInitializer from 'dummy/initializers/flexberry-maptools';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | flexberry maptools', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  FlexberryMaptoolsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
