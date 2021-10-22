import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Component | layers/group layer', function (hooks) {
  setupTest(hooks);

  test('it return L.LayerGroup on createLayer', function (assert) {
    assert.expect(1);

    const component = this.owner.factoryFor('component:layers/group-layer').create();
    const layer = component.createLayer();
    assert.ok(layer instanceof L.LayerGroup, 'Expected L.LayerGroup instance');
  });

  test('it not call _leafletObject.setZIndex on setZIndex', function (assert) {
    assert.expect(1);

    const component = this.owner.factoryFor('component:layers/group-layer').create();
    const leafletLayerPromiseResolved = assert.async();
    component.get('_leafletLayerPromise').then((leafletLayer) => {
      const layer = component.get('_leafletObject');
      const spy = sinon.spy(layer, 'setZIndex');

      component.setZIndex(0);

      assert.equal(spy.callCount, 0);
    }).finally(() => {
      leafletLayerPromiseResolved();
    });
  });
});
