/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('switch-scale-control', 'Unit | Component | switch scale control', {
  unit: true,
});

test('it should return L.Control.SwitchScaleControl from createControl', function (assert) {
  const component = this.subject();

  // Renders the component to the page.
  const control = component.createControl();

  assert.ok(control instanceof L.Control.SwitchScaleControl);
});
