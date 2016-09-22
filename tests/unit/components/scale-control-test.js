import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('scale-control', 'Unit | Component | scale control', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test('it should return L.Control.Scale from createControl', function(assert) {
  let component = this.subject();

  // Renders the component to the page.
  let control = component.createControl();

  assert.ok(control instanceof L.Control.Scale);
});
