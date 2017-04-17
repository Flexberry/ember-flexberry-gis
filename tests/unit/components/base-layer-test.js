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

test('it should call layer.setZIndex on setZIndex', function (assert) {
  assert.expect(1);

  let setZIndex = sinon.spy();
  let component = this.subject({
    createLayer() {
      return { setZIndex };
    }
  });

  let leafletLayerPromiseResolved = assert.async();
  component.get('leafletLayerPromise').then((leafletLayer) => {
    component.setZIndex();
    assert.ok(setZIndex.called);
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should throw exception if visibilityDidChange without container', function (assert) {
  assert.expect(1);

  let component = this.subject({
    createLayer
  });

  let leafletLayerPromiseResolved = assert.async();
  component.get('leafletLayerPromise').then((leafletLayer) => {
    assert.throws(() => {
      component.visibilityDidChange();
    });
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should call visibilityDidChange and setZIndex on render', function(assert) {
  assert.expect(2);

  let visibilityDidChange = sinon.spy();
  let setZIndex = sinon.spy();

  let component = this.subject({
    createLayer,
    visibilityDidChange,
    setZIndex
  });

  this.render();

  let leafletLayerPromiseResolved = assert.async();
  component.get('leafletLayerPromise').then((leafletLayer) => {
    assert.ok(visibilityDidChange.called, 'should call visibilityDidChange');
    assert.ok(setZIndex.called, 'should call setZIndex');
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});

test('should call container addLayer/removeLayer based on visibility property', function(assert) {
  assert.expect(4);

  let addLayer = sinon.spy();
  let removeLayer = sinon.spy();

  let component = this.subject({
    createLayer,

    leafletContainer: {
      addLayer,
      removeLayer
    }
  });

  let leafletLayerPromiseResolved = assert.async();
  component.get('leafletLayerPromise').then((leafletLayer) => {
    component.set('visibility', true);

    assert.ok(addLayer.calledOnce, 'addLayer should be called once');
    assert.ok(addLayer.calledWith(layer), 'addLayer should be called with layer instance');

    component.set('visibility', false);

    assert.ok(removeLayer.calledOnce, 'removeLayer should be called once');
    assert.ok(removeLayer.calledWith(layer), 'removeLayer should be called with layer instance');
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});
