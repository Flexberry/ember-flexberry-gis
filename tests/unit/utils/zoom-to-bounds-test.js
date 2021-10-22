import { zoomToBounds } from 'ember-flexberry-gis/utils/zoom-to-bounds';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utility | zoom to bounds', function () {
  test('fitBounds by zoom bounds.pad(1)', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    const corner1 = L.latLng(58.712, 57.227);
    const corner2 = L.latLng(58.774, 57.125);
    const bounds = L.latLngBounds(corner1, corner2);
    const leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13, });
    const fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
    leafletMap.once('zoomend', () => {
      assert.equal(leafletMap.getZoom(), leafletMap.getBoundsZoom(bounds.pad(1)));
      assert.equal(fitBoundsSpy.callCount, 0);
      done();
      fitBoundsSpy.restore();
    });
    zoomToBounds(bounds, leafletMap);
  });
  test('fitBounds by minZoom', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    const corner1 = L.latLng(58.712, 57.227);
    const corner2 = L.latLng(58.774, 57.125);
    const bounds = L.latLngBounds(corner1, corner2);
    const leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13, });
    const fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
    const getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(10);
    leafletMap.once('zoomend', () => {
      assert.equal(leafletMap.getZoom(), 11);
      assert.equal(fitBoundsSpy.callCount, 0);
      done();
      fitBoundsSpy.restore();
      getBoundsZoomStub.restore();
    });
    const minZoom = 11;
    let maxZoom;
    zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
  });
  test('fitBounds by maxZoom', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    const corner1 = L.latLng(58.712, 57.227);
    const corner2 = L.latLng(58.774, 57.125);
    const bounds = L.latLngBounds(corner1, corner2);
    const leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13, });
    const fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
    const getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(10);
    leafletMap.once('zoomend', () => {
      assert.equal(leafletMap.getZoom(), 9);
      assert.equal(fitBoundsSpy.callCount, 0);
      done();
      fitBoundsSpy.restore();
      getBoundsZoomStub.restore();
    });
    let minZoom;
    const maxZoom = 9;
    zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
  });
  test('fitBounds by maxZoom and minZoom', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    const corner1 = L.latLng(58.712, 57.227);
    const corner2 = L.latLng(58.774, 57.125);
    const bounds = L.latLngBounds(corner1, corner2);
    const leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13, });
    const fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
    const getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(8);
    leafletMap.once('zoomend', () => {
      assert.equal(leafletMap.getZoom(), 9);
      assert.equal(fitBoundsSpy.callCount, 0);
      done();
      fitBoundsSpy.restore();
      getBoundsZoomStub.restore();
    });
    const minZoom = 9;
    const maxZoom = 11;
    zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
  });
  test('fitBounds by zoom of bounds', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    const corner1 = L.latLng(58.712, 57.227);
    const corner2 = L.latLng(58.774, 57.125);
    const bounds = L.latLngBounds(corner1, corner2);
    const leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13, });
    const fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
    const getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(10);
    leafletMap.once('zoomend', () => {
      assert.equal(leafletMap.getZoom(), 10);
      assert.equal(fitBoundsSpy.callCount, 0);
      done();
      fitBoundsSpy.restore();
      getBoundsZoomStub.restore();
    });
    const minZoom = 9;
    const maxZoom = 11;
    zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
  });
});
