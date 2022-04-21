/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('layers/tile-layer', 'Unit | Component | layers/tile layer', {
  unit: true,
  needs: [
    'service:map-api',
    'service:layers-styles-renderer',
    'service:i18n',
    'service:local-storage'
  ],
});

test('it return L.TileLayer on createLayer', function (assert) {
  const component = this.subject({
    requiredOptions: [''],
  });
  const layer = component.createLayer();
  assert.ok(layer instanceof L.TileLayer, 'Expected L.TileLayer instance');
});
