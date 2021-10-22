import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | switch scale control', function (hooks) {
  setupTest(hooks);

  test('it should return L.Control.SwitchScaleControl from createControl', function (assert) {
    const component = this.owner.factoryFor('component:switch-scale-control').create();

    // Renders the component to the page.
    const control = component.createControl();

    assert.ok(control instanceof L.Control.SwitchScaleControl);
  });
});
