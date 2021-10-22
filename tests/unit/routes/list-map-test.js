import ListMapRoute from 'ember-flexberry-gis/routes/list-map';
import { module, test } from 'qunit';

module('Unit | Route | list-map', function() {
  test('it exists', function(assert) {
    let route = ListMapRoute.create({});
    assert.ok(route);
  });
});
