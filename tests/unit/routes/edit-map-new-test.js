import EditMapNewRoute from 'ember-flexberry-gis/routes/edit-map-new';
import { module, test } from 'qunit';

module('Unit | Route | edit-map-new');

test('it exists', function(assert) {
  let route = EditMapNewRoute.create({});
  assert.ok(route);
});
