import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('minimap-control', 'Unit | Component | minimap control', {
  unit: true
});

test('it should return L.Control.MiniMap from createControl', function(assert) {
  let component = this.subject();

  // Renders the component to the page.
  let control = component.createControl();

  assert.ok(control instanceof L.Control.MiniMap);
});
