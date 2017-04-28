import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('switch-scale-control', 'Unit | Component | switch scale control', {
  unit: true
});

test('it should return L.Control.SwitchScaleControl from createControl', function(assert) {
  let component = this.subject();

  // Renders the component to the page.
  let control = component.createControl();

  assert.ok(control instanceof L.Control.SwitchScaleControl);
});
