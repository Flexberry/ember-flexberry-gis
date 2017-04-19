import Ember from 'ember';
import LeafletEventsMixin from 'ember-flexberry-gis/mixins/leaflet-events';
import { module, test } from 'qunit';
import sinon from 'sinon';

let MixinImplementation = Ember.Object.extend(LeafletEventsMixin);

module('Unit | Mixin | leaflet events');

// Replace this with your real tests.
test('it works', function (assert) {
  let subject = MixinImplementation.create();
  assert.ok(subject);
});

test('usedLeafletEvents should return events with exists methods', function (assert) {
  let subject = MixinImplementation.create({
    leafletEvents: ['testEvent1', 'testEvent2'],
    testEvent1: () => { }
  });

  assert.deepEqual(subject.get('usedLeafletEvents'), ['testEvent1']);
});

test('_addEventListeners should create eventHandles for used events', function (assert) {

  let addEventListener = sinon.spy();

  let subject = MixinImplementation.create({
    usedLeafletEvents: ['testEvent1', 'testEvent2'],
    _leafletObject: { addEventListener }
  });

  subject._addEventListeners();

  assert.ok(addEventListener.calledTwice);
  assert.ok(subject.get('_eventHandlers').hasOwnProperty('testEvent1'));
  assert.ok(subject.get('_eventHandlers').hasOwnProperty('testEvent2'));
});

test('_removeEventListener shoud remove all used eventHandles', function (assert) {
  let removeEventListener = sinon.spy();

  let subject = MixinImplementation.create({
    usedLeafletEvents: ['testEvent1', 'testEvent2'],
    _eventHandlers: {
      testEvent1: '',
      testEvent2: ''
    },
    _leafletObject: { removeEventListener }
  });

  subject._removeEventListeners();

  assert.ok(removeEventListener.calledTwice);
  assert.notOk(subject.get('_eventHandlers').hasOwnProperty('testEvent1'));
  assert.notOk(subject.get('_eventHandlers').hasOwnProperty('testEvent2'));
  assert.deepEqual(subject.get('_eventHandlers'), {});
});
