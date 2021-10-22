import EmberObject from '@ember/object';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import { module, test } from 'qunit';

const MixinImplementation = EmberObject.extend(LeafletOptionsMixin);

module('Unit | Mixin | leaflet options', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const subject = MixinImplementation.create();
    assert.ok(subject);
  });

  test('get(options) should return object with specified properties', function (assert) {
    const subject = MixinImplementation.create({
      leafletOptions: ['testOption1', 'testOption2'],
      testOption1: '222',
      testOption2: 333,
    });

    const options = subject.get('options');

    assert.deepEqual(options, {
      testOption1: '222',
      testOption2: 333,
    });
  });
});
