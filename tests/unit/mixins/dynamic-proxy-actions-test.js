import Ember from 'ember';
import DynamicProxyActionsMixin from 'ember-flexberry-gis/mixins/dynamic-proxy-actions';
import DynamicProxyActionObject from 'ember-flexberry-gis/objects/dynamic-proxy-action';
import { module, test } from 'qunit';

let ClassWithDynamicProxyActionsMixin = Ember.Object.extend(DynamicProxyActionsMixin, {});
let ComponentWithDynamicProxyActionsMixin = Ember.Component.extend(DynamicProxyActionsMixin, {});

module('Unit | Mixin | dynamic-proxy-actions mixin');

test('Mixin throws assertion failed exception if it\'s owner hasn\'t \'sendAction\' method', function (assert) {
  assert.expect(1);

  try {
    ClassWithDynamicProxyActionsMixin.create({
      dynamicProxyActions: []
    });
  } catch (ex) {
    assert.strictEqual(
      (/wrong\s*type\s*of\s*.*sendAction.*/gi).test(ex.message),
      true,
      'Throws assertion failed exception if mixin\'s owner hasn\'t \'sendAction\' method');
  }
});

test('Mixin throws assertion failed exception (while \'sendAction\' executes) if specified \'dynamicProxyActions\' is not array', function (assert) {
  let wrongDynamicProxyActionsArray = Ember.A([1, true, false, 'some string', {}, function() {}, new Date(), new RegExp()]);

  assert.expect(wrongDynamicProxyActionsArray.length);

  wrongDynamicProxyActionsArray.forEach((wrongDynamicProxyActions) => {
    let component = ComponentWithDynamicProxyActionsMixin.create({
      dynamicProxyActions: wrongDynamicProxyActionsArray
    });

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*dynamicProxyActions.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if specified \'dynamicProxyActions\' property is \'' +
        Ember.typeOf(wrongDynamicProxyActions) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if owner\'s parent component doesn\'t have \'sendAction\' method.', function (assert) {
  let wrongTargetObjectsArray = Ember.A([null, 1, true, false, {}, [], function() {}, new Date(), new RegExp(), { sendAction: function() {} }]);

  // Assertion shouldn't be send for last object containing 'sendAction' method,
  // that's why length - 1.
  assert.expect(wrongTargetObjectsArray.length - 1);

  wrongTargetObjectsArray.forEach((wrongTargetObject) => {
    let component = ComponentWithDynamicProxyActionsMixin.create({
      dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
        on: 'someAction',
        actionName: 'someNewAction',
        actionArguments: null
      })])
    });
    component.targetObject = wrongTargetObject;

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s.*parent\s.*sendAction.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if owner\'s \'targetObject\' doesn\'t have \'sendAction\' method.');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicProxyActions\' has wrong \'on\' property', function (assert) {
  let wrongOnPropertiesArray = Ember.A([1, true, false, {}, [], function() {}, new Date(), new RegExp()]);

  assert.expect(wrongOnPropertiesArray.length);

  wrongOnPropertiesArray.forEach((wrongOnProperty) => {
    let component = ComponentWithDynamicProxyActionsMixin.create({
      dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
        on: wrongOnProperty,
        actionName: null,
        actionArguments: null
      })])
    });

    let parentComponent = Ember.Component.extend({}).create();
    component.targetObject = parentComponent;

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*on.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicProxyActions\' has \'on\' property of wrong type \'' +
        Ember.typeOf(wrongOnProperty) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicProxyActions\' has wrong \'actionName\' property', function (assert) {
  let wrongActionNamesArray = Ember.A([1, true, false, {}, [], function() {}, new Date(), new RegExp()]);

  assert.expect(wrongActionNamesArray.length);

  wrongActionNamesArray.forEach((wrongActionName) => {
    let component = ComponentWithDynamicProxyActionsMixin.create({
      dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
        on: 'someAction',
        actionName: wrongActionName,
        actionArguments: null
      })])
    });

    let parentComponent = Ember.Component.extend({}).create();
    component.targetObject = parentComponent;

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*actionName.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicProxyActions\' has \'actionName\' property of wrong type \'' +
        Ember.typeOf(wrongActionName) + '\'');
    }
  });
});

test('Mixin throws assertion failed exception if one of specified \'dynamicProxyActions\' has wrong \'actionArguments\' property', function (assert) {
  let wrongActionArgumentsArray = Ember.A([1, true, false, 'some string', {}, function() {}, new Date(), new RegExp()]);

  assert.expect(wrongActionArgumentsArray.length);

  wrongActionArgumentsArray.forEach((wrongActionArguments) => {
    let component = ComponentWithDynamicProxyActionsMixin.create({
      dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
        on: 'someAction',
        actionName: 'someNewAction',
        actionArguments: wrongActionArguments
      })])
    });

    let parentComponent = Ember.Component.extend({}).create();
    component.targetObject = parentComponent;

    try {
      component.sendAction('someAction');
    } catch (ex) {
      assert.strictEqual(
        (/wrong\s*type\s*of\s*.*actionArguments.*/gi).test(ex.message),
        true,
        'Throws assertion failed exception if one of specified \'dynamicProxyActions\' has \'actionArguments\' property of wrong type \'' +
        Ember.typeOf(wrongActionArguments) + '\'');
    }
  });
});

test('Mixin does\'t break it\'s owner\'s standard \'sendAction\' logic', function (assert) {
  assert.expect(1);

  let component = ComponentWithDynamicProxyActionsMixin.create({
    dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
      on: 'someAction',
      actionName: 'someNewAction',
      actionArguments: null
    })])
  });

  let parentComponent = Ember.Component.extend({}).create();
  component.targetObject = parentComponent;

  let someActionHandlerHasBeenCalled = false;
  component.someAction = function() {
    someActionHandlerHasBeenCalled = true;
  };

  component.sendAction('someAction');
  assert.strictEqual(
    someActionHandlerHasBeenCalled,
    true,
    'Component still normally triggers proper action handlers');
});

test('Mixin makes parent component to resend child component\'s actions specified in it\'s \'dynamicProxyActions\'', function (assert) {
  assert.expect(1);

  let component = ComponentWithDynamicProxyActionsMixin.create({
    dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
      on: 'someAction',
      actionName: 'someNewAction',
      actionArguments: null
    })])
  });

  let parentComponent = Ember.Component.extend({}).create();
  component.targetObject = parentComponent;

  let someNewActionHandlerHasBeenCalled = false;
  parentComponent.someNewAction = function() {
    someNewActionHandlerHasBeenCalled = true;
  };

  component.sendAction('someAction');
  assert.strictEqual(
    someNewActionHandlerHasBeenCalled,
    true,
    'Parent component resends child component\'s \'someAction\' as \'someNewAction\'');
});

test('Mixin makes parent component to resend child component\'s actions specified in it\'s \'dynamicProxyActions\' with additional \'actionArguments\'', function (assert) {
  assert.expect(1);

  let originalActionArguments = Ember.A(['firstOriginalArgument', 'secondOriginalArgument']);
  let dynamicProxyActionArguments = Ember.A(['firstDynamicArgument', 'secondDynamicArgument']);
  let someNewActionHandlerArguments = null;

  let component = ComponentWithDynamicProxyActionsMixin.create({
    dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
      on: 'someAction',
      actionName: 'someNewAction',
      actionArguments: dynamicProxyActionArguments
    })])
  });

  let parentComponent = Ember.Component.extend({}).create();
  component.targetObject = parentComponent;

  parentComponent.someNewAction = function(...args) {
    someNewActionHandlerArguments = Ember.A(args);
  };

  component.sendAction('someAction', ...originalActionArguments);
  assert.strictEqual(
    someNewActionHandlerArguments[0] === dynamicProxyActionArguments[0] &&
    someNewActionHandlerArguments[1] === dynamicProxyActionArguments[1] &&
    someNewActionHandlerArguments[2] === originalActionArguments[0] &&
    someNewActionHandlerArguments[3] === originalActionArguments[1],
    true,
    'Parent component resends child component\'s \'someAction\' as \'someNewAction\' with additional arguments added to the beginning of the arguments array');
});

test('Mixin allows to add/remove \'dynamicProxyActions\' at run time', function (assert) {
  assert.expect(2);

  let dynamicProxyActions = Ember.A();

  let component = ComponentWithDynamicProxyActionsMixin.create({
    dynamicProxyActions: dynamicProxyActions
  });

  let parentComponent = Ember.Component.extend({}).create();
  component.targetObject = parentComponent;

  let someNewActionHandlerHasBeenCalled = false;
  parentComponent.someNewAction = function() {
    someNewActionHandlerHasBeenCalled = true;
  };

  let dynamicProxyAction = DynamicProxyActionObject.create({
    on: 'someAction',
    actionName: 'someNewAction',
    actionArguments: null
  });
  component.get('dynamicProxyActions').pushObject(dynamicProxyAction);

  component.sendAction('someAction');
  assert.strictEqual(
    someNewActionHandlerHasBeenCalled,
    true,
    'Parent component resends child component\'s \'someAction\' as \'someNewAction\' for dynamic action proxy added in run time');

  someNewActionHandlerHasBeenCalled = false;
  component.get('dynamicProxyActions').removeObject(dynamicProxyAction);

  component.sendAction('someAction');
  assert.strictEqual(
    someNewActionHandlerHasBeenCalled,
    false,
    'Parent component doesn\'t resend child component\'s \'someAction\' as \'someNewAction\' for dynamic action proxy removed in run time');
});

test('Mixin makes parent component to resend child component\'s actions specified in multiple \'dynamicProxyActions\'', function (assert) {
  assert.expect(4);

  let component = ComponentWithDynamicProxyActionsMixin.create({
    dynamicProxyActions: Ember.A([DynamicProxyActionObject.create({
      on: 'firstAction',
      actionName: 'newFirstAction',
      actionArguments: null
    }), DynamicProxyActionObject.create({
      on: 'secondAction',
      actionName: 'newSecondAction',
      actionArguments: null
    }), DynamicProxyActionObject.create({
      on: 'firstAction',
      actionName: 'newFirstActionAgain',
      actionArguments: null
    })])
  });

  let parentComponent = Ember.Component.extend({}).create();
  component.targetObject = parentComponent;

  let newFirstActionHandlerHasBeenCalled = false;
  parentComponent.newFirstAction = function() {
    newFirstActionHandlerHasBeenCalled = true;
  };

  let newSecondActionHandlerHasBeenCalled = false;
  parentComponent.newSecondAction = function() {
    newSecondActionHandlerHasBeenCalled = true;
  };

  let newFirstActionAgainHandlerHasBeenCalled = false;
  parentComponent.newFirstActionAgain = function() {
    newFirstActionAgainHandlerHasBeenCalled = true;
  };

  component.sendAction('firstAction');
  assert.strictEqual(
    newFirstActionHandlerHasBeenCalled && newFirstActionAgainHandlerHasBeenCalled,
    true,
    'Parent component resends child component\'s \'firstAction\' as \'newFirstAction\' & as \'newFirstActionAgain\'');
  assert.strictEqual(
    newSecondActionHandlerHasBeenCalled,
    false,
    'Parent component doesn\'t resend child component\'s \'secondAction\' as \'newSecondAction\'');

  newFirstActionHandlerHasBeenCalled = false;
  newSecondActionHandlerHasBeenCalled = false;
  newFirstActionAgainHandlerHasBeenCalled = false;

  component.sendAction('secondAction');
  assert.strictEqual(
    newSecondActionHandlerHasBeenCalled,
    true,
    'Parent component resends child component\'s \'secondAction\' as \'newSecondAction\'');
  assert.strictEqual(
    newFirstActionHandlerHasBeenCalled || newFirstActionAgainHandlerHasBeenCalled,
    false,
    'Parent component doesn\'t resend child component\'s \'firstAction\' as \'newSecondAction\' & as \'newFirstActionAgain\'');
});
