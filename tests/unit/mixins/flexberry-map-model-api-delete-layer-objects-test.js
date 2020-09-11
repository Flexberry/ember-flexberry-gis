import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method deleteLayerObjects');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method deleteLayerObjects', function(assert) {
  //Arrange
  let done = assert.async(1);
  let testLeafletObject = L.featureGroup();
  let polygon = L.polygon([[1, 1], [2, 5], [2, 5]]).addTo(testLeafletObject);
  polygon.id = '1';
  let obj = { _deleteLayerFromAttrPanel:  function() {} };
  let getModelLayerFeature = () => { return Ember.RSVP.resolve([null, testLeafletObject]); };

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {},
    mapApi: { getFromApi() { return obj._deleteLayerFromAttrPanel; } },
    _getLayerFeatureId(layer, shape) { return shape.id; }
  });
  let getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);
  let spyDeleteLayerFromAttrPanelFunc = sinon.spy(obj, '_deleteLayerFromAttrPanel');
  let spyRemoveLayer = sinon.spy(testLeafletObject, 'removeLayer');

  //Act
  let result = subject.deleteLayerObjects('1', ['1']);

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise);
  result.then(()=> {
    assert.equal(spyDeleteLayerFromAttrPanelFunc.callCount, 1);
    assert.equal(getMLFeature.callCount, 1);
    assert.equal(getMLFeature.args[0][0], '1');
    assert.deepEqual(getMLFeature.args[0][1], ['1']);
    assert.equal(spyRemoveLayer.callCount, 1);
    assert.equal(spyRemoveLayer.args[0][0].id, '1');
    assert.equal(testLeafletObject.getLayers().length, 0);
    done();
    spyDeleteLayerFromAttrPanelFunc.restore();
    spyRemoveLayer.restore();
    getMLFeature.restore();
  });
});
