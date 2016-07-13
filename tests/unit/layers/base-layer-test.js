import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

moduleFor('component:base-layer', 'Unit | Layer | Base layer', {
  unit: true
});

test('it should throw at create layer', function (assert) {
  let layer = this.subject();
  assert.throws(() => {
    layer.createLayer();
  });
});

test('it should impelement toggleVisible dependent on model.visibility', function(assert) {
  assert.expect(2);

  let model = Ember.Object.create({ visibility: true });

  let container = {
    addLayer() {},
    removeLayer() {}
  };

  let layer = this.subject();

  layer.set('model', model);
  layer.set('container', container);

  let addLayer = sinon.spy(container, 'addLayer');
  let removeLayer = sinon.spy(container, 'removeLayer');

  layer.toggleVisible();

  assert.ok(addLayer.calledOnce, 'should call addLayer if model is visible');

  model.set('visibility', false);

  layer.toggleVisible();

  assert.ok(removeLayer.calledOnce, 'should call removeLayer if model is invisible');

});
