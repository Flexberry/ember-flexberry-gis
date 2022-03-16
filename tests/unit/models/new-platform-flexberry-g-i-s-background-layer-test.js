import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-background-layer', 'Unit | Model | new-platform-flexberry-g-i-s-background-layer', {
  // Specify the other units that are required for this test.
  needs: [
    'model:new-platform-flexberry-g-i-s-background-layer',
    'model:new-platform-flexberry-g-i-s-csw-connection',
    'model:new-platform-flexberry-g-i-s-data-link-parameter',
    'model:new-platform-flexberry-g-i-s-data-link',
    'model:new-platform-flexberry-g-i-s-layer-link',
    'model:new-platform-flexberry-g-i-s-layer-metadata',
    'model:new-platform-flexberry-g-i-s-link-metadata',
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'model:new-platform-flexberry-g-i-s-map-object-setting',
    'model:new-platform-flexberry-g-i-s-map',
    'model:new-platform-flexberry-g-i-s-parameter-metadata'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();

  // let store = this.store();
  assert.ok(!!model);
});
