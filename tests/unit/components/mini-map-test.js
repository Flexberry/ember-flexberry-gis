import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('mini-map', 'Unit | Component | mini map', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test('it should return L.Control.MiniMap from createControl', function(assert) {
  let component = this.subject();

  // Renders the component to the page.
  let control = component.createControl();

  assert.ok(control instanceof L.Control.MiniMap);
});
