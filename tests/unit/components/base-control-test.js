/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('base-control', 'Unit | Component | base control', {
  unit: true,
});

test('it should call leafletMap.addControl method on initControl', function (assert) {
  const addControl = sinon.spy();
  const component = this.subject({ leafletMap: { addControl, }, });

  component.initControl();

  assert.ok(addControl.calledOnce);
});
