import Ember from 'ember';
import DynamicActionsMixin from 'ember-flexberry-gis/mixins/dynamic-actions';
import DynamicActionObject from 'ember-flexberry-gis/objects/dynamic-action';
import { module, test } from 'qunit';

let ClassWithDynamicActionsMixin = Ember.Object.extend(DynamicActionsMixin, {});
let ComponentWithDynamicActionsMixin = Ember.Component.extend(DynamicActionsMixin, {});

module('Unit | Mixin | dynamic-actions mixin');

test('Mixin throws assertion failed exception if it\'s owner hasn\'t \'sendAction\' method', function (assert) {
  assert.expect(1);

  try {
    ClassWithDynamicActionsMixin.create({ dynamicActions: [] });
  } catch (ex) {
    assert.strictEqual(
      (/wrong\s*type\s*of\s*.*sendAction.*/gi).test(ex.message),
      true,
      'Throws assertion failed exception if owner hasn\'t \'sendAction\' method');
  }
});

test('Mixin throws assertion failed exception if specified \'dynamicActions\' is not array \'instance\' (while \'sendAction\' executes)', function (assert) {
  let wrongDynamicActionsArray = Ember.A([1, true, false, 'some string', {}, function() {}, new Date(), new RegExp()]);

  assert.expect(wrongDynamicActionsArray.length);

  wrongDynamicActionsArray.forEach((wrongDynamicActions) => {
    let component = ComponentWithDynamicActionsMixin.create({ dynamicActions: wrongDynamicActions });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*dynamicActions.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if specified \'dynamicActions\' property is \'' + Ember.typeOf(wrongDynamicActions) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicActions\' has wrong \'on\' property', function (assert) {
  let wrongOnPropertiesArray = Ember.A([1, true, false, {}, [], function() {}, new Date(), new RegExp()]);

  assert.expect(wrongOnPropertiesArray.length);

  wrongOnPropertiesArray.forEach((wrongOnProperty) => {
    let component = ComponentWithDynamicActionsMixin.create({
      dynamicActions: Ember.A([DynamicActionObject.create({
        on: wrongOnProperty,
        actionHandler: null,
        actionName: null,
        actionContext: null,
        actionArguments: null
      })])
    });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*on.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicActions\' has \'on\' property of wrong type \'' +
        Ember.typeOf(wrongOnProperty) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicActions\' has wrong \'actionHandler\' property', function (assert) {
  let wrongActionHandlersArray = Ember.A([1, true, false, 'some string', {}, [], new Date(), new RegExp()]);

  assert.expect(wrongActionHandlersArray.length);

  wrongActionHandlersArray.forEach((wrongActionHandler) => {
    let component = ComponentWithDynamicActionsMixin.create({
      dynamicActions: Ember.A([DynamicActionObject.create({
        on: 'someAction',
        actionHandler: wrongActionHandler,
        actionName: null,
        actionContext: null,
        actionArguments: null
      })])
    });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*actionHandler.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicActions\' has \'actionHandler\' property of wrong type \'' +
        Ember.typeOf(wrongActionHandler) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicActions\' has wrong \'actionName\' property', function (assert) {
  let wrongActionNamesArray = Ember.A([1, true, false, {}, [], function() {}, new Date(), new RegExp()]);

  assert.expect(wrongActionNamesArray.length);

  wrongActionNamesArray.forEach((wrongActionName) => {
    let component = ComponentWithDynamicActionsMixin.create({
      dynamicActions: Ember.A([DynamicActionObject.create({
        on: 'someAction',
        actionHandler: null,
        actionName: wrongActionName,
        actionContext: null,
        actionArguments: null
      })])
    });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*actionName.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicActions\' has \'actionName\' property of wrong type \'' +
        Ember.typeOf(wrongActionName) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicActions\' has defined \'actionName\', but' +
  ' wrong \'actionContext\' property (without \'send\' method)', function (assert) {
  let wrongActionContextsArray = Ember.A([null, 1, true, false, {}, [], function() {}, new Date(), new RegExp(), { send: function() {} }]);

  // Assertion shouldn't be send for last object containing 'send' method,
  // that's why length - 1.
  assert.expect(wrongActionContextsArray.length - 1);

  wrongActionContextsArray.forEach((wrongActionContext) => {
    let component = ComponentWithDynamicActionsMixin.create({
      dynamicActions: Ember.A([DynamicActionObject.create({
        on: 'someAction',
        actionHandler: null,
        actionName: 'onSomeAction',
        actionContext: wrongActionContext,
        actionArguments: null
      })])
    });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/method\s*.*send.*\s*.*actionContext.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicActions\' has defined \'actionName\', ' +
        'but wrong \'actionContext\' property (without \'send\' method)');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicActions\' has wrong \'actionArguments\' property', function (assert) {
  let wrongActionArgumentsArray = Ember.A([1, true, false, 'some string', {}, function() {}, new Date(), new RegExp()]);

  assert.expect(wrongActionArgumentsArray.length);

  wrongActionArgumentsArray.forEach((wrongActionArguments) => {
    let component = ComponentWithDynamicActionsMixin.create({
      dynamicActions: Ember.A([DynamicActionObject.create({
        on: 'someAction',
        actionHandler: null,
        actionName: null,
        actionContext: null,
        actionArguments: wrongActionArguments
      })])
    });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*actionArguments.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicActions\' has \'actionArguments\' property of wrong type \'' +
        Ember.typeOf(wrongActionArguments) + '\'');
    }
  });
});

test('Mixin does\'t break it\'s owner\'s standard \'sendAction\' logic', function (assert) {
  assert.expect(0);
});

test('Mixin triggers specified \'dynamicActions\' handlers on given context', function (assert) {
  assert.expect(0);
});
