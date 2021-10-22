import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | scale control', function(hooks) {
  setupTest(hooks);

  test('it should return L.Control.Scale from createControl', function(assert) {
    let component = this.owner.factoryFor('component:scale-control').create();

    // Renders the component to the page.
    let control = component.createControl();

    assert.ok(control instanceof L.Control.Scale);
  });
});
