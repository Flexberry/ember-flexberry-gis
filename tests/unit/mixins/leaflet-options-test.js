import EmberObject from '@ember/object';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import { module, test } from 'qunit';

let MixinImplementation = EmberObject.extend(LeafletOptionsMixin);

module('Unit | Mixin | leaflet options', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let subject = MixinImplementation.create();
    assert.ok(subject);
  });

  test('get(options) should return object with specified properties', function (assert) {
    let subject = MixinImplementation.create({
      leafletOptions: ['testOption1', 'testOption2'],
      testOption1: '222',
      testOption2: 333
    });

    let options = subject.get('options');

    assert.deepEqual(options, {
      testOption1: '222',
      testOption2: 333
    });
  });
});
