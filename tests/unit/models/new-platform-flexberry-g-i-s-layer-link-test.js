import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-layer-link', 'Unit | Model | new-platform-flexberry-g-i-s-layer-link', {
  // Specify the other units that are required for this test.
  needs: [
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'model:new-platform-flexberry-g-i-s-map-object-setting'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();

  // let store = this.store();
  assert.ok(!!model);
});
