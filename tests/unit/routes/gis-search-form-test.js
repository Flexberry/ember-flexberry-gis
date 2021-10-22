import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | gis search form', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:gis-search-form');
    assert.ok(route);
  });
});
