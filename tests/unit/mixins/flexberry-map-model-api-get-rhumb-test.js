import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | method get rhumb');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method getRhumb for LineString', function (assert) {
  //Arrange
  let done = assert.async(1);
  let coordinates = [[-41, -111.04], [45, -111.04], [45, -104.05], [41, -104.05]];
  let testPolygon = L.polygon(coordinates);
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectId) {
      return Ember.RSVP.Promise.resolve([null, null, [testPolygon]]);
    }
  });
  const resObj = {
    type: 'LineString',
    startPoint: L.latLng(-41, -111.04),
    crs: 'EPSG:4326',
    skip: 1,
    rhumbCoordinates:
    [
        {
          rhumb: 'СЗ',
          angle: 0,
          distance: 9562776.900083829
        },
        {
          rhumb: 'СВ',
          angle: 90,
          distance: 549601.2989213171
        },
        {
          rhumb: 'ЮВ',
          angle: 0,
          distance: 444780.32093413227
        },
        {
          rhumb: 'ЮЗ',
          angle: 4.438440688327262,
          distance: 9145423.193341617
        }
    ],
    coordinates:
    [
      [
        L.latLng(-41, -111.04),
        L.latLng(45, -111.04),
        L.latLng(45, -104.05),
        L.latLng(41, -104.05),
      ]
    ]
  };

  //Act
  let promise = subject.getRhumb();

  //Assert
  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then(
    (t) => {
      assert.deepEqual(t, resObj);
      done();
    });
});

test('test method getRhumb for Polygon', function (assert) {
  //Arrange
  let done = assert.async(1);
  let coordinates = [[[[-41, -111.04], [45, -111.04], [45, -104.05], [41, -104.05]]]];
  let testPolygon = L.polygon(coordinates);
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature(layerId, objectId) {
      return Ember.RSVP.Promise.resolve([null, null, [testPolygon]]);
    }
  });
  const resObj = {
    type: 'Polygon',
    startPoint: L.latLng(-41, -111.04),
    crs: 'EPSG:4326',
    skip: 1,
    rhumbCoordinates:
    [
        {
          rhumb: 'СЗ',
          angle: 0,
          distance: 9562776.900083829
        },
        {
          rhumb: 'СВ',
          angle: 90,
          distance: 549601.2989213171
        },
        {
          rhumb: 'ЮВ',
          angle: 0,
          distance: 444780.32093413227
        },
        {
          rhumb: 'ЮЗ',
          angle: 4.438440688327262,
          distance: 9145423.193341617
        }
    ],
    coordinates:
    [
      [
        [
          L.latLng(-41, -111.04),
          L.latLng(45, -111.04),
          L.latLng(45, -104.05),
          L.latLng(41, -104.05),
        ]
      ]
    ]
  };

  //Act
  let promise = subject.getRhumb();

  //Assert
  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then(
    (t) => {
      assert.deepEqual(t, resObj);
      done();
    });
});
