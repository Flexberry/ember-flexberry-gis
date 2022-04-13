/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('switch-scale-control', 'Unit | Component | switch scale control', {
  unit: true,
});

test('it should return L.Control.SwitchScaleControl from createControl', function (assert) {
  const component = this.subject();

  // Renders the component to the page.
  const control = component.createControl();

  assert.ok(control instanceof L.Control.SwitchScaleControl);
});

test('it should set switchScaleControl on leafletMap', function (assert) {
  assert.expect(6);
  const leafletMap = L.map(document.createElement('div'));
  const component = this.subject({ leafletMap, });

  const createControlSpy = sinon.spy(component, 'createControl');
  const afterCreateControlSpy = sinon.spy(component, 'afterCreateControl');
  const addControlSpy = sinon.spy(leafletMap, 'addControl');

  // Renders the component to the page.
  component.initControl();

  assert.ok(component.get('control') instanceof L.Control.SwitchScaleControl);
  assert.ok(createControlSpy.calledOnce);
  assert.ok(afterCreateControlSpy.calledOnce);
  assert.ok(addControlSpy.calledOnce);
  assert.ok(leafletMap['switchScaleControlmap-control-scalebar']);
  assert.deepEqual(leafletMap['switchScaleControlmap-control-scalebar'], component.get('control'));

  createControlSpy.restore();
  afterCreateControlSpy.restore();
  addControlSpy.restore();
});

test('it should call _restore switchScaleControl', function (assert) {
  assert.expect(9);
  const leafletMap = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13,
  });
  const component = this.subject({ leafletMap, });

  // Renders the component to the page.
  component.initControl();

  const control = component.get('control');
  const onRemoveSpy = sinon.spy(control, 'onRemove');
  const _updateRoundSpy = sinon.spy(control, '_updateRound');
  const _updateSpy = sinon.spy(control, '_update');
  const onSpy = sinon.spy(leafletMap, 'on');

  control._restore();

  assert.ok(component.get('control') instanceof L.Control.SwitchScaleControl);
  assert.ok(onRemoveSpy.calledOnce);
  assert.ok(onSpy.calledOnce);
  assert.ok(_updateRoundSpy.calledOnce);
  assert.notOk(_updateSpy.calledOnce);

  control.options.recalcOnZoomChange = true;
  control._restore();
  assert.ok(onRemoveSpy.calledTwice);
  assert.ok(onSpy.calledTwice);
  assert.ok(_updateRoundSpy.calledOnce);
  assert.ok(_updateSpy.calledOnce);

  onRemoveSpy.restore();
  _updateRoundSpy.restore();
  _updateSpy.restore();
  onSpy.restore();
});
