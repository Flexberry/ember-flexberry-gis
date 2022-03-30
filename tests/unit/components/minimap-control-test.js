import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('minimap-control', 'Unit | Component | minimap control', {
  unit: true
});

test('it should return L.Control.MiniMap from createControl', function (assert) {
  const component = this.subject();

  // Renders the component to the page.
  const control = component.createControl();

  assert.ok(control instanceof L.Control.MiniMap);
});

test('it should return L.LayerGroup from layerGroup', function (assert) {
  const component = this.subject();

  const lGroup = component.get('layerGroup');

  assert.ok(lGroup instanceof L.LayerGroup);
});
