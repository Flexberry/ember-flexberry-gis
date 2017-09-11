import Ember from 'ember';
import LocalStorageInitializer from 'ember-flexberry-gis/initializers/local-storage';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | local storage', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LocalStorageInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
