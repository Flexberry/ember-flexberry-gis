import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-expansion';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';

module('Unit | Mixin | test method createPolygonObjectRhumb');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);
let crs4326 = crsFactory4326.create();

test('test method createPolygonObjectRhumb for LineString', function (assert) {
  //Arrange
  const testLiseString = {
    type: 'LineString',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 444780.3209341317
        },
        {
          rhumb: 'NE',
          angle: 90,
          distance: 555213.4562030523
        }
    ]
  };

  let resObj = {
    type: 'Feature',
    properties: undefined,
    geometry: {
      type: 'LineString',
      coordinates: [
          [3, 7], [3, 2.9999999999999996], [8, 3]
      ]
    }
  };
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {
      return [null,
        { options: { crs: crs4326 } }];
    }
  });

  //Act
  let feature = subject.createPolygonObjectRhumb('1', testLiseString);

  //Assert
  assert.deepEqual(feature, resObj);
});

test('test method createPolygonObjectRhumb for Polygon', function (assert) {
  //Arrange
  const testLiseString = {
    type: 'Polygon',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 444780.3209341317
        },
        {
          rhumb: 'NE',
          angle: 90,
          distance: 555213.4562030523
        },
        {
          rhumb: 'NW',
          angle: 0,
          distance: 444780.3209341317
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 551831.2448362056
        }
    ]
  };

  let resObj = {
    type: 'Feature',
    properties: undefined,
    geometry: {
      type: 'Polygon',
      coordinates: [
          [[3, 7], [3, 2.9999999999999996], [8, 3], [8, 7], [3, 7]]
      ]
    }
  };
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {
      return [null,
        { options: { crs: crs4326 } }];
    }
  });

  //Act
  let feature = subject.createPolygonObjectRhumb('1', testLiseString);

  //Assert
  assert.deepEqual(feature, resObj);
});
