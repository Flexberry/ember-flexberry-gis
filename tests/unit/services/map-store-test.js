import { run } from '@ember/runloop';

import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';

import startApp from 'dummy/tests/helpers/start-app';

let App;

module('Unit | Service | map store', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    App = startApp();
  });

  hooks.afterEach(function () {
    run(App, 'destroy');
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    run(() => {
      const service = this.owner.lookup('service:map-store');
      assert.ok(service);
    });
  });

  test('it should have property osmmap after init', function (assert) {
    run(() => {
      assert.expect(3);
      const service = this.owner.lookup('service:map-store');
      const defaultMap = service.get('osmmap');
      assert.ok(defaultMap, 'Map created');
      assert.equal(defaultMap.get('mapLayer').length, 1, 'it have one map layer');
      assert.equal(defaultMap.get('mapLayer').objectAt(0).get('type'), 'osm', 'and this layer of type osm');
    });
  });
});
