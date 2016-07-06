import Ember from 'ember';
import LayercontainerMixin from 'ember-flexberry-gis/mixins/layercontainer';
import { module, test } from 'qunit';

module('Unit | Mixin | layercontainer');

// Replace this with your real tests.
test('it works', function(assert) {
  let LayercontainerObject = Ember.Object.extend(LayercontainerMixin);
  let subject = LayercontainerObject.create();
  assert.ok(subject);
});
