import Ember from 'ember';
import LeafletRequiredOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-required-options';
import { module, test } from 'qunit';

module('Unit | Mixin | leaflet required options');

let MixinImplementation = Ember.Object.extend(LeafletRequiredOptionsMixin);

test('it works', function (assert) {
  let subject = MixinImplementation.create();
  assert.ok(subject);
});

test('get(requiredOptions) should return array with specified properties', function (assert) {
  let subject = MixinImplementation.create({
    leafletRequiredOptions: ['testOption1', 'testOption2'],
    testOption1: '222',
    testOption2: 333
  });

  let options = subject.get('requiredOptions');

  assert.deepEqual(options, ['222', 333]);
});

test('get(requiredOptions) should throw if option not defined', function (assert) {
  let subject = MixinImplementation.create({
    leafletRequiredOptions: ['testOption']
  });

  assert.throws(() => {
    subject.get('requiredOptions');
  });
});
