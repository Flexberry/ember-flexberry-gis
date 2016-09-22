import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('layers/tile-layer', 'Unit | Component | layers/tile layer', {
  unit: true
});

test('it return L.TileLayer on createLayer', function(assert) {
  let component = this.subject({
    requiredOptions: ['']
  });
  let layer = component.createLayer();
  assert.ok(layer instanceof L.TileLayer, 'Expected L.TileLayer instance');
});
