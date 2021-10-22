import EmberObject from '@ember/object';
import FlexberryMapModelApiSavelayerMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-savelayer';
import { module, test } from 'qunit';

module('Unit | Mixin | flexberry map model api savelayer', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const FlexberryMapModelApiSavelayerObject = EmberObject.extend(FlexberryMapModelApiSavelayerMixin);
    const subject = FlexberryMapModelApiSavelayerObject.create();
    assert.ok(subject);
  });
});
