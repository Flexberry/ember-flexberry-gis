import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('flexberry-map', 'Unit | Component | flexberry map', {
  unit: true,
  needs: [
    "component:flexberry-layers"
  ]
});

test('it should create leaflet map on didInsertElement', function (assert) {
  let component = this.subject();
  this.render();
  assert.ok(component.get('_layer') instanceof L.Map);
});

test('should compute center from lat\lng', function (assert) {
  let lat = 10;
  let lng = 10;

  let component = this.subject({ lat, lng });

  let center = component.get('center');
  assert.ok(center instanceof L.LatLng);
  assert.ok(center.equals([10, 10]));
});

test('should pass center\zoom from properties to leaflet map', function (assert) {
  let
    lat=10,
    lng=10,
    zoom=10;

  let component = this.subject({ lat, lng, zoom });

  this.render();

  let leafletMap = component.get('_layer');

  assert.equal(leafletMap.getZoom(), 10);
  assert.ok(leafletMap.getCenter().equals([10, 10]));

  component.set('zoom', 0);
  component.set('lat', 0);
  component.set('lng', 0);

  assert.equal(leafletMap.getZoom(), 0);
  assert.ok(leafletMap.getCenter().equals([0, 0]));
});
