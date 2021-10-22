import Application from '@ember/application';
import { run } from '@ember/runloop';
import LocalStorageInitializer from 'ember-flexberry-gis/initializers/local-storage';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | local storage', function (hooks) {
  hooks.beforeEach(function () {
    run(function () {
      application = Application.create();
      application.deferReadiness();
    });
  });

  // Replace this with your real tests.
  test('it works', function (assert) {
    LocalStorageInitializer.initialize(application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });
});
