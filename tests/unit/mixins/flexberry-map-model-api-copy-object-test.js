import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method copyObject');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method copyObject', function(assert) {
  //Arrange
  assert.expect(8);
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
  let getModelLayerFeature = () => { return Ember.RSVP.resolve([{}, sourceLeafletLayer, [polygon]]); };

  let getModelLeafletObject = () => { return [destinationLayerModel, destinationLeafletLayer]; };

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {},
    _getModelLeafletObject() {}
  });
  let getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);
  let getMLObject = sinon.stub(subject, '_getModelLeafletObject', getModelLeafletObject);

  //Act
  let result = subject.copyObject({
    layerId: '1',
    objectId: '1',
    shouldRemove: true
  }, {
    layerId: '2',
    properties: {}
  });

  //Assert
  assert.ok(result instanceof Ember.RSVP.Promise, 'Check result instance of Promise');
  result.then((data)=> {
    assert.deepEqual(data.getLatLngs(), [[L.latLng(1, 1), L.latLng(5, 1), L.latLng(2, 2), L.latLng(3, 5)]], 'Check latLngs');
    assert.equal(getMLFeature.callCount, 1, 'Check call count to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][1], '1', 'Check call second arg to method _getModelLayerFeature');
    assert.equal(getMLFeature.args[0][2], true, 'Check call third arg to method _getModelLayerFeature');
    assert.equal(getMLObject.callCount, 1, 'Check call count to method _getModelLeafletObject');
    assert.equal(getMLObject.args[0][0], '2', 'Check call first arg to method _getModelLeafletObject');
    done();
    getMLFeature.restore();
    getMLObject.restore();
  });
});
