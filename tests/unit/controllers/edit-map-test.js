import EditMapController from 'ember-flexberry-gis/controllers/edit-map';
import { module, test } from 'qunit';

module('Unit | Controller | edit-map', function () {
  test('it exists', function (assert) {
    const route = EditMapController.create({});
    assert.ok(route);
  });
});
