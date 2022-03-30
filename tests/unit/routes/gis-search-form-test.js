import { moduleFor, test } from 'ember-qunit';

moduleFor('route:gis-search-form', 'Unit | Route | gis search form', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
  needs: [
    'service:mapStore'
  ],
});

test('it exists', function (assert) {
  const route = this.subject();
  assert.ok(route);
});
