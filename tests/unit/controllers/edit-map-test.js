import EditMapController from 'ember-flexberry-gis/controllers/edit-map';
import { module, test } from 'qunit';

module('Unit | Controller | edit-map');

test('it exists', function(assert) {
  let route = EditMapController.create({});
  assert.ok(route);
});
