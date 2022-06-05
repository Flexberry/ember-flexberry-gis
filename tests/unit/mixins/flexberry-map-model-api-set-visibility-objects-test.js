import { Promise } from 'rsvp';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | test method setVisibilityObjects', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  const layerModel = A({
    settingsAsObject: {
      labelSettings: {
        signMapObjects: true,
      },
    },
  });
  const _labelsLayer = L.featureGroup();
  const leafletObject = L.featureGroup();
  leafletObject.options = {
    showExisting: false,
    continueLoading: false,
  };
  leafletObject._labelsLayer = _labelsLayer;
  const firstTestLayer = L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]]).addTo(leafletObject);
  firstTestLayer.id = '1';
  const secondTestLayer = L.polygon([[10, 20], [40, 20], [40, 40], [10, 20]]).addTo(leafletObject);
  secondTestLayer.id = '2';
  const thirdTestLayer = L.polygon([[0.1, 0.2], [0.4, 0.2], [0.4, 0.4], [0.1, 0.2]]).addTo(leafletObject);
  thirdTestLayer.id = '3';
  const firstTestLabelLayer = L.marker([1, 2]).addTo(_labelsLayer);
  firstTestLabelLayer.id = '1';
  const secondTestLabelLayer = L.marker([40, 20]).addTo(_labelsLayer);
  secondTestLabelLayer.id = '2';
  const thirdTestLabelLayer = L.marker([20, 40]).addTo(_labelsLayer);
  thirdTestLabelLayer.id = '3';

  test('Test to check fail message', function (assert) {
    // Arrange
    assert.expect(4);
    const map = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13,
    });
    const done = assert.async(1);
    const subject = mapApiMixinObject.create({
      _getModelLeafletObject() { return [layerModel, leafletObject]; },
      mapApi: {
        getFromApi() { return map; },
      },
      _getLayerFeatureId(layer, shape) { return shape.id; },
    });
    const getModelLeafletObjSpy = sinon.spy(subject, '_getModelLeafletObject');

    // Act
    const result = subject._setVisibilityObjects('1', ['1', '2'], true);

    // Assert
    assert.ok(result instanceof Promise, 'Equals result = Promise');
    result.catch((res) => {
      assert.equal(res.message, 'Layer type not supported');
      assert.equal(getModelLeafletObjSpy.callCount, 1, 'Check call count to method _getModelLeafletObject');
      assert.equal(getModelLeafletObjSpy.args[0][0], '1', 'Check call first arg to method _getModelLeafletObject');
      done();
      getModelLeafletObjSpy.restore();
    });
  });
});
