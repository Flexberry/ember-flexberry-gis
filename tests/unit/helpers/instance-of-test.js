import { instanceOf } from 'dummy/helpers/instance-of';
import { module, test } from 'qunit';

module('Unit | Helper | instance of', function () {
  test('it works', function (assert) {
    assert.expect(2);
    const obj = L.layerGroup();
    let constructor = L.LayerGroup;
    let result = instanceOf([obj, constructor]);
    assert.ok(result);

    constructor = L.Control.MiniMap;
    result = instanceOf([obj, constructor]);
    assert.notOk(result);
  });
});
