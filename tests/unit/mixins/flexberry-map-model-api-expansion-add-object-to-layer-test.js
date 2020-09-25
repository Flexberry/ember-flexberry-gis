import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-expansion';
import sinon from 'sinon';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import crsFactory3395 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-3395';

module('Unit | Mixin | test method addObjectToLayer');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);
let geoJsonObject = L.polygon([[0, 100], [0, 101], [1, 101], [1, 100]]).toGeoJSON();

test('test method addObjectToLayer with EPSG:4326', function(assert) {
  //Arrange
  assert.expect(5);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg3395': crsFactory3395,
      };
    }
  });
  let leafletObject = L.featureGroup();
  leafletObject.options = { crs: { code: 'EPSG:4326' } };
  let getModelLeafletObject = () => { return [{ id: 1 }, leafletObject]; };

  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {}
  });
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);

  //Act
  let result = subject.addObjectToLayer('1', geoJsonObject);

  //Assert
  assert.equal(leafletObject.getLayers().length, 1);
  assert.equal(result.layerId, '1');
  assert.deepEqual(result._latlngs, [[L.latLng(0, 100), L.latLng(0, 101), L.latLng(1, 101), L.latLng(1, 100)]]);
  assert.equal(getMLObject.callCount, 1, 'Check call count to method _getModelLeafletObject');
  assert.equal(getMLObject.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
  ownerStub.restore();
  getMLObject.restore();
});

test('test method addObjectToLayer with EPSG:3395', function(assert) {
  //Arrange
  assert.expect(5);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg3395': crsFactory3395,
      };
    },
    knownNamesForType() {
      return ['epsg4326', 'epsg3395'];
    }
  });
  let leafletObject = L.featureGroup();
  leafletObject.options = { crs: { code: 'EPSG:4326' } };
  let getModelLeafletObject = () => { return [{ id: 1 }, leafletObject]; };

  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() {}
  });
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);

  //Act
  let result = subject.addObjectToLayer('1', geoJsonObject, 'EPSG:3395');

  //Assert
  assert.equal(leafletObject.getLayers().length, 1);
  assert.equal(result.layerId, '1');
  assert.deepEqual(result._latlngs,
    [
      [
        L.latLng(0, 0.0008983152841195215),
        L.latLng(0, 0.0009072984369607167),
        L.latLng(0.00000904328947124462, 0.0009072984369607167),
        L.latLng(0.00000904328947124462, 0.0008983152841195215)
      ]
    ]);
  assert.equal(getMLObject.callCount, 1, 'Check call count to method _getModelLeafletObject');
  assert.equal(getMLObject.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
  ownerStub.restore();
  getMLObject.restore();
});
