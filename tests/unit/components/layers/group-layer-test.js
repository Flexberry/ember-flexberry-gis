import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

let leafletMap;
moduleForComponent('layers/group-layer', 'Unit | Component | layers/group layer', {
  unit: true,
  needs: [
    'service:map-api',
    'service:layers-styles-renderer',
  ],
  beforeEach: function () {
    leafletMap = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13
    });
  }
});

test('it return L.LayerGroup on createLayer', function (assert) {
  assert.expect(1);

  const component = this.subject({ leafletMap: leafletMap });
  const layer = component.createLayer();
  assert.ok(layer instanceof L.LayerGroup, 'Expected L.LayerGroup instance');
});

test('it not call _leafletObject.setZIndex on setZIndex', function (assert) {
  assert.expect(1);

  const component = this.subject({ leafletMap: leafletMap });
  const leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then(() => {
    const layer = component.get('_leafletObject');
    const spy = sinon.spy(layer, 'setZIndex');

    component.setZIndex(0);

    assert.equal(spy.callCount, 0);
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});
