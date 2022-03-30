import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('flexberry-layers-intersections-panel', 'Unit | Component | flexberry layers intersections panel', {
  unit: true,

  needs: [
    'service:mapApi',
    'service:i18n'
  ],

});

test('test method computeCoordinates for GeometryCollection', function (assert) {
  assert.expect(1);

  const featureLineString = {
    type: 'LineString',
    coordinates: [[10, 30], [30, 10], [40, 40]],
  };
  const featurePolygon = {
    type: 'Polygon',
    coordinates: [
      [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
    ],
  };
  const featureGeometryCollection = {
    type: 'GeometryCollection',
    geometries: [featureLineString, featurePolygon],
  };

  const component = this.subject({
    layers: [],
  });
  const arrayCoord = component.computeCoordinates(featureGeometryCollection);
  assert.deepEqual(arrayCoord, [[10, 30], [30, 10], [40, 40], null, [10, 30], [40, 40], [40, 20], [20, 10], [10, 30], null]);
});

test('test method getObjectWithProperties for Polygon', function (assert) {
  assert.expect(1);

  const featurePolygon = {
    type: 'Polygon',
    coordinates: [
      [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
    ],
  };

  const component = this.subject({
    layers: [],
  });
  const arrayCoord = component.computeCoordinates(featurePolygon);
  assert.deepEqual(arrayCoord, [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]);
});
