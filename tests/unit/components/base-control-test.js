import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('base-control', 'Unit | Component | base control', {
  unit: true
});

test('it should call map.addControl method on initControl', function(assert) {
  let addControl = sinon.spy();
  let component = this.subject({ map: { addControl } });

  component.initControl();

  assert.ok(addControl.calledOnce);
});
