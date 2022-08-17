import getBooleanFromString from 'ember-flexberry-gis/utils/get-boolean-from-string';
import { module, test } from 'qunit';
module('Unit | Utility | get boolean from string');

// Replace this with your real tests.
test('it works', function(assert) {
  assert.equal(null, getBooleanFromString());
  assert.ok(getBooleanFromString('true'));
  assert.notOk(getBooleanFromString('нет'));
});
