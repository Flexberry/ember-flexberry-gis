import ListMapController from 'ember-flexberry-gis/controllers/list-map';
import { module, test } from 'qunit';

module('Unit | Controller | list-map', function () {
  test('it exists', function (assert) {
    const route = ListMapController.create({});
    assert.ok(route);
  });
});
