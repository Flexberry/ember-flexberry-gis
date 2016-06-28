import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-layer-metadata', 'Unit | Model | new-platform-flexberry-g-i-s-layer-metadata', {
  needs: [
    'transform:jsonobject'
  ]
});

test('it exists', function (assert) {
  let model = this.subject();

  // let store = this.store();
  assert.ok(!!model);
});
