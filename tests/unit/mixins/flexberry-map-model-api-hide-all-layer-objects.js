import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import OdataVector from 'ember-flexberry-gis/layers/odata-vector';

module('Unit | Mixin | test method');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method hideAllLayerObjects', function(assert) {
  //Arrange
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let labelsLayer = L.featureGroup().addTo(map);
  labelsLayer.addLayer(L.marker([1, 1]));
  let leafletObject = L.featureGroup().addTo(map);
  leafletObject.addLayer(L.polygon([[1, 1]]));
  leafletObject._labelsLayer = labelsLayer;
  let subject = mapApiMixinObject.create({
    mapLayer: {
      findBy() { return Ember.A({ _leafletObject: leafletObject, settingsAsObject: { labelSettings: { signMapObjects: true } } }); }
    },
    _getTypeLayer() { return new OdataVector(); },
    mapApi: { getFromApi() { return map; } }
  });
  let spyHasLayer = sinon.spy(map, 'hasLayer');
  let spyRemoveLayer = sinon.spy(map, 'removeLayer');

  //Act
  subject.hideAllLayerObjects();

  //Assert
  assert.equal(spyHasLayer.callCount, 2);
  assert.equal(spyRemoveLayer.callCount, 3);
  spyHasLayer.restore();
  spyRemoveLayer.restore();
});
