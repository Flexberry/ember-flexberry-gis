import { instanceOf } from 'dummy/helpers/instance-of';
import { module, test } from 'qunit';

module('Unit | Helper | instance of');

// Replace this with your real tests.
test('it works', function(assert) {
  assert.expect(2);
  let obj = L.layerGroup();
  let constructor = L.LayerGroup;
  let result = instanceOf([obj, constructor]);
  assert.ok(result);

  constructor = L.Control.MiniMap;
  result = instanceOf([obj, constructor]);
  assert.notOk(result);
});
