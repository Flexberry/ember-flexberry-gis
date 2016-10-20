import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-map', 'Unit | Serializer | new-platform-flexberry-g-i-s-map', {
  // Specify the other units that are required for this test.
  needs: [
    'model:new-platform-flexberry-g-i-s-map'
  ]
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
