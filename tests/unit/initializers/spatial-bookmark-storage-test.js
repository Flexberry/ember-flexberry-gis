import Ember from 'ember';
import SpatialBookmarkStorageInitializer from 'dummy/initializers/spatial-bookmark-storage';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | spatial bookmark storage', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  SpatialBookmarkStorageInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
