/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('layers/wms-layer', 'Unit | Component | layers/wms layer', {
  unit: true,
  needs: [
    'service:map-api',
    'service:layers-styles-renderer'
  ],
});

test('it return L.TileLayer.wms on createLayer', function (assert) {
  const component = this.subject({
    requiredOptions: [''],
  });
  const layer = component.createLayer();
  assert.ok(layer instanceof L.TileLayer.WMS, 'Expected L.TileLayer.wms instance');
});
