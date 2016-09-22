import ListMapController from 'ember-flexberry-gis/controllers/list-map';
import { module, test } from 'qunit';

module('Unit | Controller | list-map');

test('it exists', function(assert) {
  let route = ListMapController.create({});
  assert.ok(route);
});
