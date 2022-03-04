import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

moduleForComponent('switch-scale-control', 'Unit | Component | switch scale control', {
  unit: true
});

test('it should return L.Control.SwitchScaleControl from createControl', function(assert) {
  let component = this.subject();

  // Renders the component to the page.
  let control = component.createControl();

  assert.ok(control instanceof L.Control.SwitchScaleControl);
});

test('it should set switchScaleControl on leafletMap', function(assert) {
  assert.expect(6);
  let leafletMap = L.map(document.createElement('div'));
  let component = this.subject({ leafletMap: leafletMap });

  let createControlSpy = sinon.spy(component, 'createControl');
  let afterCreateControlSpy = sinon.spy(component, 'afterCreateControl');
  let addControlSpy = sinon.spy(leafletMap, 'addControl');

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

test('it should call _restore switchScaleControl', function(assert) {
  assert.expect(9);
  let leafletMap = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });
  let component = this.subject({ leafletMap: leafletMap });

  // Renders the component to the page.
  component.initControl();

  let control = component.get('control');
  let onRemoveSpy = sinon.spy(control, 'onRemove');
  let _updateRoundSpy = sinon.spy(control, '_updateRound');
  let _updateSpy = sinon.spy(control, '_update');
  let onSpy = sinon.spy(leafletMap, 'on');

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
