import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('flexberry-map', 'Unit | Component | flexberry map', {
  unit: true,
  needs: [
    'component:flexberry-layers'
  ]
});

test('it should create leaflet map on didInsertElement', function (assert) {
  let component = this.subject();
  this.render();
  assert.ok(component.get('_leafletObject') instanceof L.Map);
});

test('should compute center from lat/lng', function (assert) {
  let lat = 10;
  let lng = 10;

  let component = this.subject({ lat, lng });

  let center = component.get('center');
  assert.ok(center instanceof L.LatLng);
  assert.ok(center.equals([10, 10]));
});

test('should pass center/zoom from properties to leaflet map', function (assert) {
  assert.expect(4);

  let component = this.subject({
    lat: 10,
    lng: 10,
    zoom: 10
  });

  this.render();

  let leafletMap = component.get('_leafletObject');

  assert.equal(leafletMap.getZoom(), 10);
  assert.ok(leafletMap.getCenter().equals([10, 10]));

  Ember.run(() => {
    component.set('zoom', 0);
  });

  assert.equal(leafletMap.getZoom(), 0);

  // after update to leaflet-1.0.0 panTo not directly change center,
  // it will changed after animation will trigger moveend
  let promise = new Ember.Test.promise((resolve) => {
    leafletMap.on('moveend', resolve);
  });

  Ember.run(() => {
    component.setProperties({
      'lat': 0,
      'lng': 0
    });
  });

  return promise.then(() => {
    assert.ok(leafletMap.getCenter().equals([0, 0]));
  });
});

test('should pass zoomSnap/zoomDelta options to leaflet map', function (assert) {
  let component = this.subject({
    zoomSnap: 0.5,
    zoomDelta: 0.1
  });

  this.render();

  let leafletMap = component.get('_leafletObject');

  assert.equal(leafletMap.options.zoomSnap, 0.5);
  assert.equal(leafletMap.options.zoomDelta, 0.1);
});
