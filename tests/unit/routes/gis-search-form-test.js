import { module, test } from 'qunit';
/* eslint-disable ember/no-restricted-resolver-tests */
import { setupTest } from 'ember-qunit';

module('Unit | Route | gis search form', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:gis-search-form');
    assert.ok(route);
  });
});
