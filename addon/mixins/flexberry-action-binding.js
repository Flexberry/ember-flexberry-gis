/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing dynamic action binding logic for those flexberry components,
  which consumes their inner structure as [JSON-object](http://www.json.org/)
  or [Ember-object](http://emberjs.com/api/classes/Ember.Object.html).

  @class FlexberryActionBindigMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Action bindings from {{#crossLink "FlexberryActionBindingMixin:actionBindings:property"}}'actionBindings' property{{/crossLink}},
    mapped from array to a [JSON-object](http://www.json.org/).

    @property _actionBindings
    @type Object
    @readonly
    @private
  */
  _actionBindings: Ember.computed('actionBindings.[]', function() {
    let actionBindings = this.get('actionBindings');
    let result = {};

    Ember.assert(
      `Wrong type of component\`s \`actionBindings\` propery: actual type is ${Ember.typeOf(actionBindings)}, ` +
      `but none or array is expected.`,
      Ember.isNone(actionBindings) || Ember.isArray(actionBindings));

    if (Ember.isNone(actionBindings)) {
      return result;
    }

    actionBindings.forEach((actionBinding, index) => {
      if (Ember.isNone(result[actionBinding.on])) {
        result[actionBinding.on] = Ember.A();
      }

      let actionHandlerPath = 'actionBindings[' + index + '].actionHandler';
      let actionHandler = actionBinding.actionHandler;
      Ember.assert(
        `Wrong type of component\`s \`${actionHandlerPath}\` propery: actual type is ${Ember.typeOf(actionHandler)}, ` +
        `but function is expected.`,
        Ember.typeOf(actionHandler) === 'function');

      let actionArgumentsPath = 'actionBindings[' + index + '].actionArguments';
      let actionArguments = actionBinding.actionArguments;
      Ember.assert(
        `Wrong type of component\`s \`${actionArgumentsPath}\` propery: actual type is ${Ember.typeOf(actionArguments)}, ` +
        `but none or array is expected.`,
        Ember.isNone(actionArguments) || Ember.isArray(actionArguments));

      result[actionBinding.on].pushObject({
        actionHandler: actionHandler,
        actionArguments: actionArguments || []
      });
    });

    return result;
  }),

  /**
    Actions bindings.
    If component isn't defined explicitly in the .hbs markup,
    and there is no way to attach actions handlers,
    then you can define action bindings somewhere in code & pass defined array to this property.

    @property actionBindings
    @type FlexberryActionBindingObject[]
    @default null
  */
  actionBindings: null,

  /**
    Initializes dynamic action binding logic.
  */
  init() {
    this._super(...arguments);

    let originalSendAction = this.sendAction;
    Ember.assert(
        `Wrong type of \`sendAction\` propery: actual type is ${Ember.typeOf(originalSendAction)}, ` +
        `but function is expected.`,
        Ember.typeOf(originalSendAction) === 'function');

    // Override 'sendAction' method to add some custom logic.
    this.sendAction = (...args) => {
      // Call standard logic first.
      originalSendAction.apply(this, args);

      // Get dynamically binded action handlers.
      let actionName = args[0];
      let actionBindings = this.get('_actionBindings.' + actionName);

      if (!Ember.isArray(actionBindings)) {
        return;
      }

      // Call dynamically binded action handlers.
      actionBindings.forEach((actionBinding) => {
        let actionHandler = actionBinding.actionHandler;
        let actionArguments = actionBinding.actionArguments;

        actionHandler(...actionArguments, ...args.slice(1));
      });
    };
  }
});