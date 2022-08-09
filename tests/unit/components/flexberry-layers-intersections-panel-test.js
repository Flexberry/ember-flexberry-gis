import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import sinon from 'sinon';

moduleForComponent('flexberry-layers-intersections-panel', 'Unit | Component | flexberry layers intersections panel', {
  unit: true
});

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

  let component = this.subject({
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

  let component = this.subject({
    layers: []
  });
  let arrayCoord = component.computeCoordinates(featurePolygon);
  assert.deepEqual(arrayCoord, [[10, 30], [40, 40], [40, 20], [20, 10], [10, 30]]);
});

test('test loadIntersectionLayers', function(assert) {
  let component = this.subject({
    layers: [],
  });

  sinon.stub(component, '_checkTypeLayer', function(someArg) {
    return true;
  });

  let emptyLayerTree = { layers: [] };

  let layerTree1 =  Ember.Object.create({
    name:'rootLayer',
    layers:[Ember.Object.create({
              name:'layer1',
              layers:[]
            }),
            Ember.Object.create({
              name:'layer2',
              layers:[]
            })
    ]
  }); // Tree of depth 1

  let layerTree2 = Ember.Object.create(
    {
      name: 'rootLayer',
      layers: [Ember.Object.create({
                name:'layer1',
                layers:[
                  Ember.Object.create({
                    name:'layer11',
                    layers:[]
                  }),
                  Ember.Object.create({
                    name:'layer12',
                    layers:[]
                  })
                ]
              }),
              Ember.Object.create({
                name:'layer2',
                layers:[]
              })
      ]
    }); // Tree of depth 2

  let layerTree3 = Ember.Object.create({
    name: 'rootLayer',
    layers: [Ember.Object.create({
              name:'layer1',
              layers:[Ember.Object.create({
                name:'layer11',
                layers:[Ember.Object.create({
                  name:'layer111',
                  layers:[Ember.Object.create({
                    name:'layer1111',
                    layers:[]
                  })]
                })]
              })]
            })

      ]
  }); // Tree of depth 3

  let testList1 = component.loadIntersectionLayers(emptyLayerTree.layers);
  assert.equal(0, testList1.length, 'emptyList');

  let testList2 = component.loadIntersectionLayers(layerTree1.layers);
  assert.equal(2, testList2.length, 'layer tree depth 1 with 2 inner layers');
  let testList3 = component.loadIntersectionLayers(layerTree2.layers);
  assert.equal(3, testList3.length, 'layer tree depth 2 with 3 inner layers');
  let testList4 = component.loadIntersectionLayers(layerTree3.layers);
  assert.equal('layer1111', testList4[0].get('name'), 'layer tree depth 4 with 1 inner layer');
});
