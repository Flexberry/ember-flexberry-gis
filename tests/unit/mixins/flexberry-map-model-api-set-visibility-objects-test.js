import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | test method setVisibilityObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let layerModel = Ember.A({
  settingsAsObject: {
    labelSettings: {
      signMapObjects: true
    }
  }
});
let _labelsLayer = L.featureGroup();
let leafletObject = L.featureGroup();
leafletObject.options = {
  showExisting: false,
  continueLoading: false
};
leafletObject._labelsLayer = _labelsLayer;
let firstTestLayer = L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]]).addTo(leafletObject);
firstTestLayer.id = '1';
let secondTestLayer = L.polygon([[10, 20], [40, 20], [40, 40], [10, 20]]).addTo(leafletObject);
secondTestLayer.id = '2';
let thirdTestLayer = L.polygon([[0.1, 0.2], [0.4, 0.2], [0.4, 0.4], [0.1, 0.2]]).addTo(leafletObject);
thirdTestLayer.id = '3';
let firstTestLabelLayer = L.marker([1, 2]).addTo(_labelsLayer);
firstTestLabelLayer.id = '1';
let secondTestLabelLayer = L.marker([40, 20]).addTo(_labelsLayer);
secondTestLabelLayer.id = '2';
let thirdTestLabelLayer = L.marker([20, 40]).addTo(_labelsLayer);
thirdTestLabelLayer.id = '3';

test('Test to check fail message', function(assert) {
  //Arrange
  assert.expect(4);
  let map = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({
    _getModelLeafletObject() { return [layerModel, leafletObject]; },
    mapApi: {
      getFromApi() { return map; }
    },
    _getLayerFeatureId(layer, shape) { return shape.id; },
  });
  let getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');

  //Act
  let result = subject._setVisibilityObjects('1', ['1', '2'], true);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Equals result = Promise');
  result.catch((res)=> {
    assert.equal(res, 'Layer type not supported');
    assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getModelLeafletObjSpy.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
    done();
    getModelLeafletObjSpy.restore();
  });
});
