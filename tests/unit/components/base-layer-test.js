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
  let setZIndex = sinon.spy();
  let component = this.subject({
    createLayer() {
      return { setZIndex };
    }
  });

  component.setZIndex();

  assert.ok(setZIndex.called);
});

test('should throw exception if visibilityDidChange without container', function (assert) {
  let component = this.subject({
    createLayer
  });

  assert.throws(() => {
    component.visibilityDidChange();
  });
});

test('should call visibilityDidChange and setZIndex on render', function(assert) {
  let visibilityDidChange = sinon.spy();
  let setZIndex = sinon.spy();

  this.subject({
    createLayer,
    visibilityDidChange,
    setZIndex
  });

  this.render();

  assert.ok(visibilityDidChange.called, 'should call visibilityDidChange');
  assert.ok(setZIndex.called, 'should call setZIndex');
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

  component.set('visibility', true);

  assert.ok(addLayer.calledOnce, 'addLayer should be called once');
  assert.ok(addLayer.calledWith(layer), 'addLayer should be called with layer instance');

  component.set('visibility', false);

  assert.ok(removeLayer.calledOnce, 'removeLayer should be called once');
  assert.ok(removeLayer.calledWith(layer), 'removeLayer should be called with layer instance');
});
