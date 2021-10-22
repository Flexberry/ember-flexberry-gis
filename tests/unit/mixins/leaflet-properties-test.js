import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Mixin | leaflet properties', function () {
  const MixinImplementation = EmberObject.extend(LeafletPropertiesMixin);

  // Replace this with your real tests.
  test('it works', function (assert) {
    const subject = MixinImplementation.create();
    assert.ok(subject);
  });

  test('_addObservers should call this.addObserver for specified properties', function (assert) {
    const property = 'testProperty';
    const subject = MixinImplementation.create({
      leafletProperties: [property],
    });

    const addObserver = sinon.spy(subject, 'addObserver');

    subject._addObservers();

    assert.ok(addObserver.calledWith(property));
  });

  test('after addObserver property changed should fire specified layer function', function (assert) {
    const callTestProperty = sinon.spy();

    const subject = MixinImplementation.create({
      leafletProperties: ['testProperty:callTestProperty'],
      _leafletObject: { callTestProperty, },
    });

    subject._addObservers();
    run(() => {
      subject.set('testProperty', 'property');
    });

    assert.ok(callTestProperty.called);
  });

  test('after addObserver property changed should fire default setter for property of layer', function (assert) {
    const setTestProperty = sinon.spy();

    const subject = MixinImplementation.create({
      leafletProperties: ['testProperty'],
      _leafletObject: { setTestProperty, },
    });

    subject._addObservers();
    run(() => {
      subject.set('testProperty', 'property');
    });

    assert.ok(setTestProperty.called);
  });

  test('after addObserver property changed should throws if layer property setter is missing', function (assert) {
    const subject = MixinImplementation.create({
      leafletProperties: ['testProperty'],
      _leafletObject: {},
    });

    subject._addObservers();

    assert.throws(() => {
      subject.set('testProperty', 'property');
    });
  });
});
