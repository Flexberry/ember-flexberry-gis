import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Component | base control', function (hooks) {
  setupTest(hooks);

  test('it should call leafletMap.addControl method on initControl', function (assert) {
    const addControl = sinon.spy();
    const component = this.owner.factoryFor('component:base-control').create({ leafletMap: { addControl, }, });

    component.initControl();

    assert.ok(addControl.calledOnce);
  });
});
