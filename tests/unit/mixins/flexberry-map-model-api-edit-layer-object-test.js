import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import crsFactory3395 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-3395';

module('Unit | Mixin | test method editLayerObject');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);
let geoJsonObject = L.polygon([[0, 100], [0, 101], [1, 101], [1, 100]]).toGeoJSON();
let leafletObject = L.polygon([[1, 0], [2, 3], [3, 1], [3, 0]]);
let leafletLayer = {
  options: {
    crs: {
      code: 'EPSG:4326'
    }
  },
  editLayer: () => {}
};

test('test method editLayerObject with EPSG:4326', function(assert) {
  //Arrange
  let done = assert.async(1);
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
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {
      return Ember.RSVP.resolve([null, leafletLayer, [leafletObject]]);
    }
  });
  let spyEditLayer = sinon.spy(leafletLayer, 'editLayer');

  //Act
  let result = subject.editLayerObject(null, null, geoJsonObject, 'EPSG:4326');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(spyEditLayer.callCount, 1);
    assert.deepEqual(res._latlngs, [[L.latLng(0, 100), L.latLng(0, 101), L.latLng(1, 101), L.latLng(1, 100)]]);
    done();
    spyEditLayer.restore();
    ownerStub.restore();
  });
});

test('test method editLayerObject with EPSG:3395', function(assert) {
  //Arrange
  let done = assert.async(1);
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
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {
      return Ember.RSVP.resolve([null, leafletLayer, [leafletObject]]);
    }
  });
  let spyEditLayer = sinon.spy(leafletLayer, 'editLayer');
  let spyUnProject = sinon.spy(L.CRS.EPSG3395, 'unproject');

  //Act
  let result = subject.editLayerObject(null, null, geoJsonObject, 'EPSG:3395');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(spyEditLayer.callCount, 1);
    assert.equal(spyUnProject.callCount, 5);
    assert.deepEqual(res._latlngs,
      [
        [
          L.latLng(0, 0.0008983152841195215),
          L.latLng(0, 0.0009072984369607167),
          L.latLng(0.00000904328947124462, 0.0009072984369607167),
          L.latLng(0.00000904328947124462, 0.0008983152841195215)
        ]
      ]);
    done();
    spyUnProject.restore();
    spyEditLayer.restore();
    ownerStub.restore();
  });
});
