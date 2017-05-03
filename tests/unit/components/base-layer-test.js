import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('base-layer', 'Unit | Component | base layer', {
  unit: true
});

// stubs for createLayer method
let layer = {};
let createLayer = () => { return layer; };

test('it should throw at init', function (assert) {
  assert.throws(() => {
    this.subject();
  });
});

test('it should call layer.setZIndex on _setLayerZIndex', function (assert) {
  assert.expect(1);

  let setZIndex = sinon.spy();
  let component = this.subject({
    createLayer() {
      return {
        setZIndex
      };
    }
  });

  let leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then((leafletLayer) => {
    component._setLayerZIndex();
    assert.ok(setZIndex.called);
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should call _setLayerVisibility and _setLayerZIndex on render', function(assert) {
  assert.expect(2);

  let setLayerVisibility = sinon.spy();
  let setLayerZIndex = sinon.spy();

  let component = this.subject({
    createLayer: createLayer,
    _setLayerVisibility: setLayerVisibility,
    _setLayerZIndex: setLayerZIndex
  });

  this.render();

  let leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then((leafletLayer) => {
    assert.ok(setLayerVisibility.called, 'should call visibilityDidChange');
    assert.ok(setLayerZIndex.called, 'should call setZIndex');
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should call container addLayer/removeLayer based on visibility property', function(assert) {
  assert.expect(4);

  let addLayer = sinon.spy();
  let removeLayer = sinon.spy();

  let leafletContainerHasLayer = false;
  let hasLayer = function() {
    return leafletContainerHasLayer;
  };

  let component = this.subject({
    createLayer,

    leafletContainer: {
      addLayer,
      removeLayer,
      hasLayer
    }
  });

  let leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then((leafletLayer) => {
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
