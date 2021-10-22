import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | layers/wms layer', function(hooks) {
  setupTest(hooks);

  test('it return L.TileLayer.wms on createLayer', function(assert) {
    let component = this.owner.factoryFor('component:layers/wms-layer').create({
      requiredOptions: ['']
    });
    let layer = component.createLayer();
    assert.ok(layer instanceof L.TileLayer.WMS, 'Expected L.TileLayer.wms instance');
  });
});
