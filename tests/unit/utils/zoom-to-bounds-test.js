import { zoomToBounds } from 'ember-flexberry-gis/utils/zoom-to-bounds';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utility | zoom to bounds');

test('fitBounds by zoom bounds.pad(1)', function(assert) {
  assert.expect(2);
  var done = assert.async(1);
  let corner1 = L.latLng(58.712, 57.227);
  let corner2 = L.latLng(58.774, 57.125);
  let bounds = L.latLngBounds(corner1, corner2);
  let leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13 });
  let fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
  leafletMap.once('zoomend', () => {
    assert.equal(leafletMap.getZoom(), leafletMap.getBoundsZoom(bounds.pad(1)));
    assert.equal(fitBoundsSpy.callCount, 0);
    done();
    fitBoundsSpy.restore();
  });
  zoomToBounds(bounds, leafletMap);
});
test('fitBounds by minZoom', function(assert) {
  assert.expect(2);
  var done = assert.async(1);
  let corner1 = L.latLng(58.712, 57.227);
  let corner2 = L.latLng(58.774, 57.125);
  let bounds = L.latLngBounds(corner1, corner2);
  let leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13 });
  let fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
  let getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(10);
  leafletMap.once('zoomend', () => {
    assert.equal(leafletMap.getZoom(), 11);
    assert.equal(fitBoundsSpy.callCount, 0);
    done();
    fitBoundsSpy.restore();
    getBoundsZoomStub.restore();
  });
  let minZoom = 11;
  let maxZoom;
  zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
});
test('fitBounds by maxZoom', function(assert) {
  assert.expect(2);
  var done = assert.async(1);
  let corner1 = L.latLng(58.712, 57.227);
  let corner2 = L.latLng(58.774, 57.125);
  let bounds = L.latLngBounds(corner1, corner2);
  let leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13 });
  let fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
  let getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(10);
  leafletMap.once('zoomend', () => {
    assert.equal(leafletMap.getZoom(), 9);
    assert.equal(fitBoundsSpy.callCount, 0);
    done();
    fitBoundsSpy.restore();
    getBoundsZoomStub.restore();
  });
  let minZoom;
  let maxZoom = 9;
  zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
});
test('fitBounds by maxZoom and minZoom', function(assert) {
  assert.expect(2);
  var done = assert.async(1);
  let corner1 = L.latLng(58.712, 57.227);
  let corner2 = L.latLng(58.774, 57.125);
  let bounds = L.latLngBounds(corner1, corner2);
  let leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13 });
  let fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
  let getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(8);
  leafletMap.once('zoomend', () => {
    assert.equal(leafletMap.getZoom(), 9);
    assert.equal(fitBoundsSpy.callCount, 0);
    done();
    fitBoundsSpy.restore();
    getBoundsZoomStub.restore();
  });
  let minZoom = 9;
  let maxZoom = 11;
  zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
});
test('fitBounds by zoom of bounds', function(assert) {
  assert.expect(2);
  var done = assert.async(1);
  let corner1 = L.latLng(58.712, 57.227);
  let corner2 = L.latLng(58.774, 57.125);
  let bounds = L.latLngBounds(corner1, corner2);
  let leafletMap = L.map(document.createElement('div'), { center: [57.505, 57.09], zoom: 13 });
  let fitBoundsSpy = sinon.spy(leafletMap, 'fitBounds');
  let getBoundsZoomStub = sinon.stub(leafletMap, 'getBoundsZoom').returns(10);
  leafletMap.once('zoomend', () => {
    assert.equal(leafletMap.getZoom(), 10);
    assert.equal(fitBoundsSpy.callCount, 0);
    done();
    fitBoundsSpy.restore();
    getBoundsZoomStub.restore();
  });
  let minZoom = 9;
  let maxZoom = 11;
  zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
});
