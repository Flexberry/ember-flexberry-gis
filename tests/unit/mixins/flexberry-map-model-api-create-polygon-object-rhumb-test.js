import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-expansion';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';

module('Unit | Mixin | test method createPolygonObjectRhumb');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);
let crs4326 = crsFactory4326.create();

let crsFactory32640 = {
  code: 'EPSG:32640',
  definition: '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs',
  create() {
    let crs = L.extend({}, new L.Proj.CRS(this.code, this.definition), {
      scale: function (zoom) {
        return 256 * Math.pow(2, zoom);
      },
      zoom: function (scale) {
        return Math.log(scale / 256) / Math.LN2;
      }
    });
    return crs;
  }
};

let crs32640 = crsFactory32640.create();

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
          distance: 10
        },
        {
          rhumb: 'NE',
          angle: 90,
          distance: 10
        }
    ]
  };

  let resObj = {
    type: 'Feature',
    properties: undefined,
    geometry: {
      type: 'LineString',
      coordinates: [
          [3, 7], [3.0000000000000013, -3], [13.000000000000002, -2.9999999999999996]
      ]
    },
    crs: {
      properties: {
        name: 'EPSG:4326'
      },
      type: 'name'
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
    startPoint: [30, 70],
    crs: 'EPSG:32640',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 10
        },
        {
          rhumb: 'NE',
          angle: 90,
          distance: 10
        },
        {
          rhumb: 'NW',
          angle: 0,
          distance: 10
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 10
        }
    ]
  };

  let resObj = {
    type: 'Feature',
    properties: undefined,
    geometry: {
      type: 'Polygon',
      coordinates: [
          [[30, 70], [30, 60], [40, 60], [40, 70], [30, 70]]
      ]
    },
    crs: {
      properties: {
        name: 'EPSG:32640'
      },
      type: 'name'
    }
  };
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {
      return [null,
        { options: { crs: crs32640 } }];
    }
  });

  //Act
  let feature = subject.createPolygonObjectRhumb('1', testLiseString);

  //Assert
  assert.deepEqual(feature, resObj);
});
