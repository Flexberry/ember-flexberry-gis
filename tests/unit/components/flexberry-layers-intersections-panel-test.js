import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | flexberry layers intersections panel', function(hooks) {
  setupTest(hooks);

  test('test method computeCoordinates for GeometryCollection', function (assert) {
    assert.expect(1);

    let featureLineString = {
      type: 'LineString',
      coordinates: [[10, 30], [30, 10], [40, 40]]
    };
    let featurePolygon = {
      type: 'Polygon',
      coordinates: [
        [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
      ]
    };
    let featureGeometryCollection = {
      type: 'GeometryCollection',
      geometries: [featureLineString, featurePolygon]
    };

    let component = this.owner.factoryFor('component:flexberry-layers-intersections-panel').create({
      layers: []
    });
    let arrayCoord = component.computeCoordinates(featureGeometryCollection);
    assert.deepEqual(arrayCoord, [[10, 30], [30, 10], [40, 40], null, [10, 30], [40, 40], [40, 20], [20, 10], [10, 30], null]);
  });

  test('test method getObjectWithProperties for Polygon', function (assert) {
    assert.expect(1);

    let featurePolygon = {
      type: 'Polygon',
      coordinates: [
        [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
      ]
    };

    let component = this.owner.factoryFor('component:flexberry-layers-intersections-panel').create({
      layers: []
    });
    let arrayCoord = component.computeCoordinates(featurePolygon);
    assert.deepEqual(arrayCoord, [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]);
  });
});
