import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-background-layer', 'Unit | Serializer | new-platform-flexberry-g-i-s-background-layer', {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:new-platform-flexberry-g-i-s-background-layer',
    'transform:file',
    'transform:decimal',
    'transform:guid',

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

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
