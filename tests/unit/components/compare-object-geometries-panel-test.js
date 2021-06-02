import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('compare-object-geometries-panel', 'Unit | Component | compare object geometries panel', {
  unit: true
});

test('test method getObjectWithProperties for GeometryCollection', function (assert) {
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

  let component = this.subject();
  let strCoord = component.getObjectWithProperties(featureGeometryCollection);
  assert.equal(strCoord.intersectionCoordsText, '10 30 \n30 10 \n40 40 \n\n10 30 \n40 40 \n40 20 \n20 10 \n10 30 \n\n');
});

test('test method getObjectWithProperties for Polygon', function (assert) {
  assert.expect(1);

  let featurePolygon = {
    type: 'Polygon',
    coordinates: [
      [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]
    ]
  };

  let component = this.subject();
  let strCoord = component.getObjectWithProperties(featurePolygon);
  assert.equal(strCoord.intersectionCoordsText, '10 30 \n40 40 \n40 20 \n20 10 \n10 30 \n');
});
