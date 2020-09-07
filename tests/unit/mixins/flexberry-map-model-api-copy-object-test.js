import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | method copyObject');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method copyObject', function(assert) {
  //Arrange
  let done = assert.async(1);
  let sourceLeafletLayer = L.featureGroup();
  let destinationLeafletLayer = L.featureGroup();
  let polygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
  polygon.feature = {
    properties: {}
  };
  let destinationLayerModel = Ember.A({
    settingsAsObject: {
      typeGeometry: 'polygon'
    }
  });
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() { return Ember.RSVP.resolve([{}, sourceLeafletLayer, [polygon]]); },
    _getModelLeafletObject() { return [destinationLayerModel, destinationLeafletLayer]; }
  });

  //Act
  let result = subject.copyObject({
    layerId: '',
    objectId: '',
    shouldRemove: true
  }, {
    layerId: '',
    properties: {}
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((data)=> {
    assert.deepEqual(data.getLatLngs(), [[L.latLng(1, 1), L.latLng(5, 1), L.latLng(2, 2), L.latLng(3, 5)]]);
    done();
  });
});
