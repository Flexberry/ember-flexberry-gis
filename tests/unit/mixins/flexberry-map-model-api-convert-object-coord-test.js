import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import crsFactory3395 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-3395';

module('Unit | Mixin | test method _convertObjectCoordinates');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);
let geoJsonObject = L.polygon([[0, 100], [0, 101], [1, 101], [1, 100]]).toGeoJSON();

test('test method _convertObjectCoordinates with EPSG:4326', function(assert) {
  //Arrange
  assert.expect(1);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg3395': crsFactory3395,
      };
    }
  });
  let subject = mapApiMixinObject.create();

  //Act
  let result = subject._convertObjectCoordinates('EPSG:4326', geoJsonObject);

  //Assert
  assert.deepEqual(result.geometry.coordinates, [[[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]]], 'Equals rezult coordinates with test coordinates');
  ownerStub.restore();
});

test('test method _convertObjectCoordinates with EPSG:3395', function(assert) {
  //Arrange
  assert.expect(1);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg3395': crsFactory3395,
      };
    }
  });
  let subject = mapApiMixinObject.create();

  //Act
  let result = subject._convertObjectCoordinates('EPSG:4326', geoJsonObject, 'EPSG:3395');

  //Assert
  assert.deepEqual(result.geometry.coordinates, [
    [
      [11131949.079327356, 7.081154551613622e-10],
      [11243268.57012063, 7.081154551613622e-10],
      [11243268.57012063, 110579.9652218976],
      [11131949.079327356, 110579.9652218976],
      [11131949.079327356, 7.081154551613622e-10]
    ]
  ], 'Equals rezult coordinates with test coordinates');
  ownerStub.restore();
});
