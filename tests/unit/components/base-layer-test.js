/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('base-layer', 'Unit | Component | base layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'service:layers-styles-renderer',
    'service:i18n',
    'service:local-storage'
  ],
});

// stubs for createLayer method
const layer = {};
const createLayer = () => layer;

test('it should throw at init', function (assert) {
  assert.throws(() => {
    this.subject();
  });
});

test('it should call layer.setZIndex on _setLayerZIndex', function (assert) {
  assert.expect(1);

  const setZIndex = sinon.spy();
  const component = this.subject({
    createLayer() {
      return {
        setZIndex,
      };
    },
  });

  const leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then(() => {
    component._setLayerZIndex();
    assert.ok(setZIndex.called);
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should call _setLayerVisibility and _setLayerZIndex on render', function (assert) {
  assert.expect(1);

  const setLayerVisibility = sinon.spy();

  const component = this.subject({
    createLayer,
    _setLayerVisibility: setLayerVisibility,
  });

  this.render();

  const leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then(() => {
    assert.ok(setLayerVisibility.called, 'should call visibilityDidChange');
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should call container addLayer/removeLayer based on visibility property', function (assert) {
  assert.expect(4);

  const addLayer = sinon.spy();
  const removeLayer = sinon.spy();

  let leafletContainerHasLayer = false;
  const hasLayer = function () {
    return leafletContainerHasLayer;
  };

  const component = this.subject({
    createLayer,

    leafletContainer: {
      addLayer,
      removeLayer,
      hasLayer,
    },
  });

  const leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then(() => {
    component.set('visibility', true);

    assert.ok(addLayer.calledOnce, 'addLayer should be called once');
    assert.ok(addLayer.calledWith(layer), 'addLayer should be called with layer instance');

    leafletContainerHasLayer = true;
    component.set('visibility', false);

    assert.ok(removeLayer.calledOnce, 'removeLayer should be called once');
    assert.ok(removeLayer.calledWith(layer), 'removeLayer should be called with layer instance');
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});
