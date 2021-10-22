import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | layers/tile layer', function(hooks) {
  setupTest(hooks);

  test('it return L.TileLayer on createLayer', function(assert) {
    let component = this.owner.factoryFor('component:layers/tile-layer').create({
      requiredOptions: ['']
    });
    let layer = component.createLayer();
    assert.ok(layer instanceof L.TileLayer, 'Expected L.TileLayer instance');
  });
});
