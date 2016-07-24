import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import { module, test } from 'qunit';

let MixinImplementation = Ember.Object.extend(DynamicPropertiesMixin);
let dynamicProperties = { firstProperty: 'firstProperty' };

module('Unit | Mixin | dynamic properties mixin');



// Replace this with your real tests.
test('it works', function (assert) {
  let subject = MixinImplementation.create();
  assert.ok(subject);
});

test('it pass properties from dynamicProperties to object on init', function (assert) {
  assert.expect(3);

  let subject = MixinImplementation.create({ dynamicProperties });
  assert.ok(subject.get('firstProperty'));
  assert.equal(subject.get('firstProperty'), 'firstProperty');
  assert.deepEqual(subject.get('dynamicPropertiesNames'), ['firstProperty']);
});

test('it should pass properties from dynamicProperties to object on change property', function (assert) {
  assert.expect(4);

  let subject = MixinImplementation.create();
  assert.notOk(subject.get('firstProperty'));

  subject.set('dynamicProperties', dynamicProperties);
  assert.ok(subject.get('firstProperty'));
  assert.equal(subject.get('firstProperty'), 'firstProperty');
  assert.deepEqual(subject.get('dynamicPropertiesNames'), ['firstProperty']);
});

test('it should remove skipped properties', function (assert) {
  assert.expect(5);

  let subject = MixinImplementation.create({ dynamicProperties });
  let secondProperties = { secondProperty: 'secondProperty' };

  subject.set('dynamicProperties', secondProperties);

  assert.notOk(subject.get('firstProperty'));
  assert.notOk(subject.hasOwnProperty('firstProperty'));
  assert.ok(subject.get('secondProperty'));
  assert.equal(subject.get('secondProperty'), 'secondProperty');
  assert.deepEqual(subject.get('dynamicPropertiesNames'), ['secondProperty']);
});
