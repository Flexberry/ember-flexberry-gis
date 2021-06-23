import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

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

test('test action panToIntersection with geometry', function (assert) {
  assert.expect(4);

  let geometry = {
    type: 'Polygon',
    coordinates: [[[10, 20], [20, 30], [30, 40], [10, 20]]]
  };
  let mapModel = {
    _convertObjectCoordinates() {}
  };

  let component = this.subject({
    mapApi: {
      getFromApi() { return mapModel;}
    },
    crs: { code: 'EPSG:4356' }
  });

  let stubConvertCoordinates = sinon.stub(mapModel, '_convertObjectCoordinates');
  stubConvertCoordinates.returns({
    geometry: {
      type: 'Polygon',
      coordinates: [[[1, 2], [2, 3], [3, 4], [1, 2]]]
    }
  });

  let result = component._convertGeometryToFeatureLayer(geometry);

  assert.deepEqual(result.getLayers()[0].feature.geometry.type, 'Polygon');
  assert.deepEqual(result.getLayers()[0].feature.geometry.coordinates, [[[1, 2], [2, 3], [3, 4], [1, 2]]]);
  assert.deepEqual(stubConvertCoordinates.getCall(0).args[0], 'EPSG:4356');
  assert.deepEqual(stubConvertCoordinates.getCall(0).args[1].geometry.type, 'Polygon');
  stubConvertCoordinates.restore();
});
