import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('base-layer', 'Unit | Component | base layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment'
  ]
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
  var done = assert.async(1);

  let setZIndex = sinon.spy();
  let component = this.subject({
    createLayer: function() {
      return {
        setZIndex: setZIndex
      };
    }
  });

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    component._setLayerZIndex();
    assert.equal(setZIndex.callCount, 1);
  }).finally(() => {
    done();
  });
});

test('should call _setLayerVisibility and _setLayerZIndex on render', function (assert) {
  assert.expect(1);
  var done = assert.async(1);

  let setLayerVisibility = sinon.spy();

  let component = this.subject({
    createLayer: createLayer,
    _setLayerVisibility: setLayerVisibility,
  });

  this.render();

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    assert.ok(setLayerVisibility.called, 'should call visibilityDidChange');
  }).finally(() => {
    done();
  });
});

test('should call container addLayer/removeLayer based on visibility property', function(assert) {
  assert.expect(4);
  var done = assert.async(1);

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

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    component.set('visibility', true);

    assert.ok(addLayer.calledOnce, 'addLayer should be called once');
    assert.ok(addLayer.calledWith(layer), 'addLayer should be called with layer instance');

    leafletContainerHasLayer = true;
    component.set('visibility', false);

    assert.ok(removeLayer.calledOnce, 'removeLayer should be called once');
    assert.ok(removeLayer.calledWith(layer), 'removeLayer should be called with layer instance');
  }).finally(() => {
    done();
  });
});

test('should check method addCustomFilter', function (assert) {
  assert.expect(9);
  var done = assert.async(1);

  let component = this.subject({
    createLayer: createLayer
  });

  this.render();

  component.get('_leafletLayerPromise').then((leafletLayer) => {
    let filterEmpty = component.addCustomFilter(null);
    assert.equal(filterEmpty, null, 'filter is null');

    let filterForFunction = new L.Filter.LEQ('outerFilter', 10);
    let filter2 = component.addCustomFilter(filterForFunction);
    assert.equal(filter2, filterForFunction, 'filter is filterForFunction');

    let layerFilter = new L.Filter.LEQ('innerFilter', 20);
    component.set('filter', layerFilter);
    let filter3 = component.addCustomFilter(filterForFunction);
    assert.equal(filter3.filters.length, 2, 'filter is contains 2 filters');
    assert.equal(filter3.filters[0].firstValue, 'innerFilter', 'filter is contains innerFilter');
    assert.equal(filter3.filters[1].firstValue, 'outerFilter', 'filter is contains outerFilter');

    let customFilter = new L.Filter.LEQ('customFilter', 30);
    component.set('customFilter', customFilter);
    let filter4 = component.addCustomFilter(filterForFunction);
    assert.equal(filter4.filters.length, 3, 'filter is contains 3 filters');
    assert.equal(filter4.filters[0].firstValue, 'innerFilter', 'filter is contains innerFilter');
    assert.equal(filter4.filters[1].firstValue, 'outerFilter', 'filter is contains outerFilter');
    assert.equal(filter4.filters[2].firstValue, 'customFilter', 'filter is contains customFilter');
  }).finally(() => {
    done();
  });
});
