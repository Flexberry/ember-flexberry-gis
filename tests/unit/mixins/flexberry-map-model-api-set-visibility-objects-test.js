import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';

module('Unit | Mixin | test method _setVisibilityObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let map = L.map(document.createElement('div'), {
  center: [51.505, -0.09],
  zoom: 13
});
let layerModel = {
  settingsAsObject: {
    labelSettings: {
      signMapObjects: true
    }
  }
};
let _labelsLayer = {};
let leafletObject = L.featureGroup().addTo(map);
leafletObject.options = {
  showExisting: true,
  continueLoading: false
};
leafletObject._labelsLayer = 
let firstTestLayer = L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]]).addTo(leafletObject);
firstTestLayer.id = '1';
let secondTestLayer = L.polygon([[10, 20], [40, 20], [40, 40], [10, 20]]).addTo(leafletObject);
secondTestLayer.id = '2';
let thirdTestLayer = L.polygon([[0.1, 0.2], [0.4, 0.2], [0.4, 0.4], [0.1, 0.2]]).addTo(leafletObject);
thirdTestLayer.id = '3';

test('test method _setVisibilityObjects', function(assert) {
  //Arrange
  let done = assert.async(1);

  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { [layerModel, leafletObject] },
    _getTypeLayer() { return new VectorLayer(); },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; }
  });
  

  //Act
  let result = subject.getDistanceBetweenObjects('1', '4', '2', '3');

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then((res)=> {
    assert.equal(res, 55820.041009409564);
    assert.equal(getMLFeature.callCount, 2, 'Check call count to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][1], '4', 'Check call second arg to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[1][0], '2', 'Check call first arg to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[1][1], '3', 'Check call second arg to method _getModelLayerFeature');
    done();
    getMLFeature.restore();
  });
});
