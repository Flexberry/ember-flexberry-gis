import { resolve, Promise } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method deleteLayerObjects', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  test('test method deleteLayerObjects', function (assert) {
    // Arrange
    assert.expect(8);
    const done = assert.async(1);
    const testLeafletObject = L.featureGroup();
    const polygon = L.polygon([[1, 1], [2, 5], [2, 5]]).addTo(testLeafletObject);
    polygon.id = '1';
    const obj = { _deleteLayerFromAttrPanel() {}, };
    const getModelLayerFeature = () => resolve([null, testLeafletObject]);

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature() {},
      mapApi: { getFromApi() { return obj._deleteLayerFromAttrPanel; }, },
      _getLayerFeatureId(layer, shape) { return shape.id; },
    });
    const getMLFeature = sinon.stub(subject, '_getModelLayerFeature', getModelLayerFeature);
    const spyDeleteLayerFromAttrPanelFunc = sinon.spy(obj, '_deleteLayerFromAttrPanel');
    const spyRemoveLayer = sinon.spy(testLeafletObject, 'removeLayer');

    // Act
    const result = subject.deleteLayerObjects('1', ['1']);

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then(() => {
      assert.equal(spyDeleteLayerFromAttrPanelFunc.callCount, 1, 'Check call count to method _deleteLayerFromAttrPanel');
      assert.equal(getMLFeature.callCount, 1, 'Check call count to method _getModelLayerFeature');
      assert.equal(getMLFeature.args[0][0], '1', 'Check call first arg to method _getModelLayerFeature');
      assert.deepEqual(getMLFeature.args[0][1], ['1'], 'Check call second arg to method _getModelLayerFeature');
      assert.equal(spyRemoveLayer.callCount, 1, 'Check call count to method removeLayer');
      assert.equal(spyRemoveLayer.args[0][0].id, '1', 'Check call first arg to method removeLayer');
      assert.equal(testLeafletObject.getLayers().length, 0, 'Count layers in object');
      done();
      spyDeleteLayerFromAttrPanelFunc.restore();
      spyRemoveLayer.restore();
      getMLFeature.restore();
    });
  });
});
