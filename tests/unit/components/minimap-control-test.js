import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | minimap control', function(hooks) {
  setupTest(hooks);

  test('it should return L.Control.MiniMap from createControl', function(assert) {
    let component = this.owner.factoryFor('component:minimap-control').create();

    // Renders the component to the page.
    let control = component.createControl();

    assert.ok(control instanceof L.Control.MiniMap);
  });

  test('it should return L.LayerGroup from layerGroup', function(assert) {
    let component = this.owner.factoryFor('component:minimap-control').create();

    let lGroup = component.get('layerGroup');

    assert.ok(lGroup instanceof L.LayerGroup);
  });
});
