import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('zoomslider-control', 'Unit | Component | zoomslider control', {
  unit: true
});

test('it should return L.Control.Zoomslider from createControl', function(assert) {
  let component = this.subject();

  // Renders the component to the page.
  let control = component.createControl();

  assert.ok(control instanceof L.Control.Zoomslider);
});
