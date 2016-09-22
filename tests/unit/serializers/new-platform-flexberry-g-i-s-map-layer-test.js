import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-map-layer', 'Unit | Serializer | new-platform-flexberry-g-i-s-map-layer', {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:new-platform-flexberry-g-i-s-map-layer',

    'model:new-platform-flexberry-g-i-s-layer-metadata',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'model:new-platform-flexberry-g-i-s-map'
  ]
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
