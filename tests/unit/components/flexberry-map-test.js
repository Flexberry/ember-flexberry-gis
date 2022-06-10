import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('flexberry-map', 'Unit | Component | flexberry map', {
  unit: true,
  needs: [
    'component:flexberry-layers',
    'service:map-api',
    'service:i18n',
    'map-tool:drag',
    'config:environment'
  ]
});

test('it should create leaflet map on didInsertElement', function (assert) {
  let component = this.subject();
  this.render();
  assert.ok(component.get('_leafletObject') instanceof L.Map);
});

test('test function queryToMap', function (assert) {
  assert.expect(8);
  let leafletMap = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  let querySpy = sinon.stub(leafletMap, 'fire', (st, e) => {
    e.results.push({ features: Ember.RSVP.resolve([{ id: '1' }]) });
  });

  let component = this.subject({
    _leafletObject: leafletMap
  });

  let done = assert.async(2);

  let res = component._queryToMap('1', '2');

  assert.ok(res instanceof Ember.RSVP.Promise, 'Является ли результат работы функции Promise');
  res.then((e) => {
    assert.equal(e.results.length, 1, 'Length results equals 1');
    assert.equal(e.queryFilter, '1', 'Check parameter queryFilter');
    assert.equal(e.mapObjectSetting, '2', 'Check parameter mapObjectSetting');
    assert.equal(querySpy.callCount, 1, 'Count call method fire');
    assert.equal(querySpy.args[0][0], 'flexberry-map:query', 'Check call first arg to method fire');
    assert.deepEqual(querySpy.args[0][1], e, 'Check call second arg to method fire');
    e.results[0].features.then((result) => {
      assert.equal(result[0].id, 1, 'Cherck result id');
      done(1);
    });
    done(1);
  });
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

  // иначе размер берется с клиента
  leafletMap._size = new L.Point(200, 200);

  assert.equal(leafletMap.getZoom(), 10, 'zoom default');
  assert.ok(leafletMap.getCenter().equals([10, 10]), 'center default');

  Ember.run(() => {
    component.set('zoom', 0);
  });

  assert.equal(leafletMap.getZoom(), 0, 'zoom after change');

  let done = assert.async(1);

  // After update to leaflet-1.0.0 panTo not directly change center,
  // it will changed after animation will trigger 'moveend' event.
  leafletMap.once('moveend', () => {
    Ember.run(() => {
      setTimeout(() => {
        let size = leafletMap.getSize().x + ' ' + leafletMap.getSize().y;
        let center = leafletMap.getCenter().lat + ' ' + leafletMap.getCenter().lng;
        assert.ok(leafletMap.getCenter().equals([0, 0]), 'center after move: center: ' + center + ', size: ' + size);
        done(1);
      }, 500);
    });
  });

  Ember.run(() => {
    component.setProperties({
      lat: 0,
      lng: 0
    });
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
