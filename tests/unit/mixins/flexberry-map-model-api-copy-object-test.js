import { resolve, Promise } from 'rsvp';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | method copyObject', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  test('test method copyObject', function (assert) {
    // Arrange
    assert.expect(8);
    const done = assert.async(1);
    const sourceLeafletLayer = L.featureGroup();
    const destinationLeafletLayer = L.featureGroup();
    const polygon = L.polygon([[1, 1], [5, 1], [2, 2], [3, 5]]);
    polygon.feature = {
      properties: {},
    };
    const destinationLayerModel = A({
      settingsAsObject: {
        typeGeometry: 'polygon',
      },
    });
    const getModelLayerFeature = () => resolve([{}, sourceLeafletLayer, [polygon]]);

    const getModelLeafletObject = () => [destinationLayerModel, destinationLeafletLayer];

    const subject = mapApiMixinObject.create({
      _getModelLayerFeature() {},
      _getModelLeafletObject() {},
    });
    const getMLFeature = sinon.stub(subject, '_getModelLayerFeature').callsFake(getModelLayerFeature);
    const getMLObject = sinon.stub(subject, '_getModelLeafletObject').callsFake(getModelLeafletObject);

    // Act
    const result = subject.copyObject({
      layerId: '1',
      objectId: '1',
      shouldRemove: true,
    }, {
      layerId: '2',
      properties: {},
    });

    // Assert
    assert.ok(result instanceof Promise, 'Check result instance of Promise');
    result.then((data) => {
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
});
