import Application from '@ember/application';
import { run } from '@ember/runloop';
import FlexberryMapToolsInitializer from 'dummy/initializers/map-tools';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | map-tools', function(hooks) {
  hooks.beforeEach(function() {
    run(function() {
      application = Application.create();
      application.deferReadiness();
    });
  });

  // Replace this with your real tests.
  test('it works', function(assert) {
    FlexberryMapToolsInitializer.initialize(application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });
});
