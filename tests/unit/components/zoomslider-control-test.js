import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | zoomslider control', function(hooks) {
  setupTest(hooks);

  test('it should return L.Control.Zoomslider from createControl', function(assert) {
    let component = this.owner.factoryFor('component:zoomslider-control').create();

    // Renders the component to the page.
    let control = component.createControl();

    assert.ok(control instanceof L.Control.Zoomslider);
  });
});
