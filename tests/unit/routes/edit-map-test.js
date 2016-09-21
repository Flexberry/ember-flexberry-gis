import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import { module, test } from 'qunit';

module('Unit | Route | edit-map');

test('it exists', function(assert) {
  let route = EditMapRoute.create({});
  assert.ok(route);
});
