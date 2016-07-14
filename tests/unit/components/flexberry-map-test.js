import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('flexberry-map', 'Unit | Component | flexberry map', {
  unit: true,
  needs: [
    "component:flexberry-layers"
  ]
});

test('it should create leaflet map on init', function (assert) {
  let component = this.subject();
  assert.ok(component.get('_layer') instanceof L.Map);
});

test('should compute center from model lat\lng', function (assert) {
  let model = Ember.Object.create({
    lat: 10,
    lng: 10
  });

  let component = this.subject({ model });

  let center = component.get('center');
  assert.ok(center instanceof L.LatLng);
  assert.ok(center.equals([10, 10]));
});

test('should return zoom from model', function(assert) {
  let model = Ember.Object.create({ zoom: 10 });

  let component = this.subject({ model });

  assert.equal(component.get('zoom'), 10);
});

test('should pass center\zoom from model properties to leaflet map', function(assert) {
  let model = Ember.Object.create({
    lat: 10,
    lng: 10,
    zoom: 10
  });

  let component = this.subject({ model });
  let leafletMap = component.get('_layer');

  this.render();

  assert.equal(leafletMap.getZoom(), 10);
  assert.ok(leafletMap.getCenter().equals([10, 10]));

  model.set('zoom', 0);
  model.set('lat', 0);
  model.set('lng', 0);

  assert.equal(leafletMap.getZoom(), 0);
  assert.ok(leafletMap.getCenter().equals([0, 0]));
});
