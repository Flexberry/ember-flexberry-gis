import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import { module, test } from 'qunit';

module('Unit | Route | edit-map', function () {
  test('it exists', function (assert) {
    const route = EditMapRoute.create({});
    assert.ok(route);
  });
});
