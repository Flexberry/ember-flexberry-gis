import { Promise } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-expansion';
import sinon from 'sinon';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import crsFactory3395 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-3395';

module('Unit | Mixin | test method addObjectToLayer', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);
  const geoJsonObject = L.polygon([[0, 100], [0, 101], [1, 101], [1, 100]]).toGeoJSON();

  test('test method addObjectToLayer with EPSG:4326', function (assert) {
    // Arrange
    const done = assert.async(1);
    const ownerStub = sinon.stub(Ember, 'getOwner');
    ownerStub.returns({
      knownForType() {
        return {
          epsg4326: crsFactory4326,
          epsg3395: crsFactory3395,
        };
      },
    });
    const leafletObject = L.featureGroup();
    leafletObject.options = { crs: { code: 'EPSG:4326', }, };
    const getModelLeafletObject = () => [{ id: 1, }, leafletObject];

    const subject = mapApiMixinObject.create({
      _getModelLeafletObject() {},
    });
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);

    // Act
    const promise = subject.addObjectToLayer('1', geoJsonObject);

    assert.ok(promise instanceof Promise);

    promise.then((result) => {
      assert.equal(leafletObject.getLayers().length, 0, 'Layers count');
      assert.equal(result.layerId, '1', 'Layer id');
      assert.deepEqual(result._latlngs, [[L.latLng(0, 100), L.latLng(0, 101), L.latLng(1, 101), L.latLng(1, 100)]]);
      assert.equal(getMLObject.callCount, 1, 'Check call count to method _getModelLeafletObject');
      assert.equal(getMLObject.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
      ownerStub.restore();
      getMLObject.restore();
      done();
    });
  });

  test('test method addObjectToLayer with EPSG:3395', function (assert) {
    // Arrange
    const done = assert.async(1);
    const ownerStub = sinon.stub(Ember, 'getOwner');
    ownerStub.returns({
      knownForType() {
        return {
          epsg4326: crsFactory4326,
          epsg3395: crsFactory3395,
        };
      },
      knownNamesForType() {
        return ['epsg4326', 'epsg3395'];
      },
    });
    const leafletObject = L.featureGroup();
    leafletObject.options = { crs: { code: 'EPSG:4326', }, };
    const getModelLeafletObject = () => [{ id: 1, }, leafletObject];

    const subject = mapApiMixinObject.create({
      _getModelLeafletObject() {},
    });
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);

    // Act
    subject.addObjectToLayer('1', geoJsonObject, 'EPSG:3395').then((result) => {
      // Assert
      assert.equal(leafletObject.getLayers().length, 0);
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
      done();
    });
  });
});
