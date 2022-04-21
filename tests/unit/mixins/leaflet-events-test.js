import EmberObject from '@ember/object';
import LeafletEventsMixin from 'ember-flexberry-gis/mixins/leaflet-events';
import { module, test } from 'qunit';
import sinon from 'sinon';

const MixinImplementation = EmberObject.extend(LeafletEventsMixin);

module('Unit | Mixin | leaflet events', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const subject = MixinImplementation.create();
    assert.ok(subject);
  });

  test('usedLeafletEvents should return events with exists methods', function (assert) {
    const subject = MixinImplementation.create({
      leafletEvents: ['testEvent1', 'testEvent2'],
      testEvent1: () => { },
    });

    assert.deepEqual(subject.get('usedLeafletEvents'), ['testEvent1']);
  });

  test('_addEventListeners should create eventHandles for used events', function (assert) {
    const addEventListener = sinon.spy();

    const subject = MixinImplementation.create({
      usedLeafletEvents: ['testEvent1', 'testEvent2'],
      _leafletObject: { addEventListener, },
    });

    subject._addEventListeners();

    assert.ok(addEventListener.calledTwice);
    assert.ok(Object.prototype.hasOwnProperty.call(subject.get('_eventHandlers'), 'testEvent1'));
    assert.ok(Object.prototype.hasOwnProperty.call(subject.get('_eventHandlers'), 'testEvent2'));
  });

  test('_removeEventListener shoud remove all used eventHandles', function (assert) {
    const removeEventListener = sinon.spy();

    const subject = MixinImplementation.create({
      usedLeafletEvents: ['testEvent1', 'testEvent2'],
      _eventHandlers: {
        testEvent1: '',
        testEvent2: '',
      },
      _leafletObject: { removeEventListener, },
    });

    subject._removeEventListeners();

    assert.ok(removeEventListener.calledTwice);
    assert.notOk(Object.prototype.hasOwnProperty.call(subject.get('_eventHandlers'), 'testEvent1'));
    assert.notOk(Object.prototype.hasOwnProperty.call(subject.get('_eventHandlers'), 'testEvent2'));
    assert.deepEqual(subject.get('_eventHandlers'), {});
  });
});
