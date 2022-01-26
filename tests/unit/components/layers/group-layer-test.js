import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

let leafletMap;
moduleForComponent('layers/group-layer', 'Unit | Component | layers/group layer', {
  unit: true,
  beforeEach: function () {
    leafletMap = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13
    });
  }
});

test('it return L.LayerGroup on createLayer', function(assert) {
  assert.expect(1);

  let component = this.subject({ leafletMap: leafletMap });
  let layer = component.createLayer();
  assert.ok(layer instanceof L.LayerGroup, 'Expected L.LayerGroup instance');
});

test('it not call _leafletObject.setZIndex on setZIndex', function(assert) {
  assert.expect(1);

  let component = this.subject({ leafletMap: leafletMap });
  let leafletLayerPromiseResolved = assert.async();
  component.get('_leafletLayerPromise').then((leafletLayer) => {
    let layer = component.get('_leafletObject');
    let spy = sinon.spy(layer, 'setZIndex');

    component.setZIndex(0);

    assert.equal(spy.callCount, 0);
  }).finally(() => {
    leafletLayerPromiseResolved();
  });
});
