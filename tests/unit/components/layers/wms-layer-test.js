import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('layers/wms-layer', 'Unit | Component | layers/wms layer', {
  unit: true
});

test('it return L.TileLayer.wms on createLayer', function(assert) {
  let component = this.subject({
    requiredOptions: ['']
  });
  let layer = component.createLayer();
  assert.ok(layer instanceof L.TileLayer.WMS, 'Expected L.TileLayer.wms instance');
});
