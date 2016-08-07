/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicComponentsPlaceholderComponent from '../components/dynamic-components-placeholder';

// Validates every dynamic proxy action properties.
// Not a mixin member, so yuidoc-comments are unnecessary.
let validateDynamicPoxyActionProperties = function(dynamicPropxyAction, dynamicProxyActionIndex) {
  dynamicPropxyAction = dynamicPropxyAction || {};

  // Property 'on' must be a string.
  let on = Ember.get(dynamicPropxyAction, 'on');
  Ember.assert(
    `Wrong type of dynamicProxyActions[${dynamicProxyActionIndex}].on property: ` +
    `actual type is ${Ember.typeOf(on)}, but \`string\` is expected.`,
    Ember.typeOf(on) === 'string');

  // Property 'actionName' must be a string.
  let actionName = Ember.get(dynamicPropxyAction, 'actionName');
  Ember.assert(
    `Wrong type of dynamicProxyActions[${dynamicProxyActionIndex}].actionName property: ` +
    `actual type is ${Ember.typeOf(actionName)}, but \`string\` is expected.`,
    Ember.typeOf(actionName) === 'string');

  // Property 'actionArguments' must be an array (if defined).
  let actionArguments = Ember.get(dynamicPropxyAction, 'actionArguments');
  Ember.assert(
    `Wrong type of dynamicProxyActions[${dynamicProxyActionIndex}].actionArguments property: ` +
    `actual type is ${Ember.typeOf(actionArguments)}, but \`array\` is expected.`,
    Ember.isNone(actionArguments) || Ember.isArray(actionArguments));
};

/**
  Mixin containing logic making available proxy-actions, for those child components that were
  dynamically embedded into some parent component, and actions they are sending
  must be catched and resended by parent component with some other action names
  and maybe with some additional arguments.

  @class DynamicProxyActionsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Component's dynamic proxy-actions from
    {{#crossLink "DynamicProxyActionsMixin:dynamicProxyActions:property"}}'dynamicProxyActions' property{{/crossLink}},
    mapped from array into flat [JSON-object](http://www.json.org/).

    @property _dynamicProxyActions
    @type Object
    @readOnly
    @private
  */
  _dynamicProxyActions: Ember.computed(
    'dynamicProxyActions.[]',
    'dynamicProxyActions.@each.on',
    'dynamicProxyActions.@each.actionName',
    'dynamicProxyActions.@each.actionArguments',
    function() {
      let dynamicProxyActions = this.get('dynamicProxyActions');
      let result = {};

      Ember.assert(
        `Wrong type of \`dynamicProxyActions\` propery: ` +
        `actual type is ${Ember.typeOf(dynamicProxyActions)}, but \`array\` is expected.`,
        Ember.isNone(dynamicProxyActions) || Ember.isArray(dynamicProxyActions));

      if (!Ember.isArray(dynamicProxyActions)) {
        return result;
      }

      for (let i = 0, len = dynamicProxyActions.length; i < len; i++) {
        let dynamicProxyAction = dynamicProxyActions[i];
        validateDynamicPoxyActionProperties(dynamicProxyAction, i);

        let on = Ember.get(dynamicProxyAction, 'on');
        if (Ember.isNone(result[on])) {
          result[on] = Ember.A();
        }

        result[on].pushObject(dynamicProxyAction);
      }

      return result;
    }
  ),

  /**
    Component's proxy-actions, that be catched and resended by parent component
    with some other action names and maybe with some additional arguments.

    @property dynamicProxyActions
    @type DynamicProxyActionObject[]
    @default null
  */
  dynamicProxyActions: null,

  /**
    Returns flag, indicating whether action handler is defined, for action with the specified name, or not.

    @method _actionHandlerIsDefined
    @param {Object} options Method options
    @param {String} options.actionName Name of component's action for which handler's existence this method should check. 
    @returns {Boolean} Flag, indicating whether action handler is defined, for action with the specified name, or not.
    @private
  */
  _actionHandlerIsDefined(options) {
    options = options || {};
    let actionName = Ember.get(options, 'actionName');

    return this.get(`_dynamicProxyActions.${actionName}.length`) > 0 || this._super(...arguments);
  },

  /**
    Initializes dynamic proxy-actions logic.
  */
  init() {
    this._super(...arguments);

    let originalSendAction = this.get('sendAction');
    Ember.assert(
      `Wrong type of \`sendAction\` propery: actual type is ${Ember.typeOf(originalSendAction)}, ` +
      `but \`function\` is expected.`,
      Ember.typeOf(originalSendAction) === 'function');

    // Override 'sendAction' method to add some custom logic.
    this.sendAction = (...args) => {
      let actionName = args[0];
      let originalSendActionIsOverridden = originalSendAction !== Ember.Component.prototype.sendAction;
      let outerActionHandlerIsDefined = Ember.typeOf(this.get(`attrs.${actionName}`)) === 'function' ||
        Ember.typeOf(this.get(`attrs.${actionName}`)) === 'string';

      // Call for overridden send action, or call for standard 'sendAction' (sending action outside).
      // Overridden 'sendAction' must be called anywhere,
      // but call for standard 'sendAction' must be executed only if outer action handler is defined,
      // otherwise ember will call to component's inner method with the same name (as action name),
      // for example if you send 'remove' action, then (if outer handler isn't defined) component's
      // 'remove' method will be called, what will cause unexpected behavior and exceptions.
      if (originalSendActionIsOverridden || outerActionHandlerIsDefined) {
        originalSendAction.apply(this, args);
      }

      let dynamicProxyActions = this.get(`_dynamicProxyActions.${actionName}`);

      // If no dynamic proxy-actions defined for action with given name,
      // break custom 'sendAction' logic then.
      if (!Ember.isArray(dynamicProxyActions)) {
        return;
      }

      // Retrieve parentComponent (skip dynamic-components-placeholder,
      // because it is only inner renderer for child dynamic components and should be skipped
      // in child actions proxying process).
      let parentComponent = this.get('targetObject');
      while (!Ember.isNone(parentComponent) && parentComponent instanceof DynamicComponentsPlaceholderComponent) {
        parentComponent = parentComponent.get('targetObject');
      }

      let parentComponentSendAction = Ember.isNone(parentComponent) ? undefined : Ember.get(parentComponent, 'sendAction');
      Ember.assert(
        `Wrong type of parent component\`s \`sendAction\` propery: ` +
        `actual type is ${Ember.typeOf(parentComponentSendAction)}, but \`function\` is expected.`,
        Ember.typeOf(parentComponentSendAction) === 'function');

      // Call action's with names specified in proxy-actions on parent component.
      // Here we can be sure that all dynamic proxy-actions are fully valid,
      // because they were validated in process of '_dynamicProxyActions' computation.
      for (let i = 0, len = dynamicProxyActions.length; i < len; i++) {
        let dynamicProxyAction = dynamicProxyActions[i];
        let actionName = Ember.get(dynamicProxyAction, 'actionName');
        let actionArguments = Ember.get(dynamicProxyAction, 'actionArguments') || [];

        // Original action arguments (without action name passed to 'sendAction' method).
        let originalActionArguments = args.slice(1);

        // Combined action arguments.
        let combinedActionArguments = [...actionArguments, ...originalActionArguments];

        // Send on parent component action with name specified in proxy-action.
        if (Ember.typeOf(actionName) === 'string') {
          parentComponent.sendAction(actionName, ...combinedActionArguments);
        }
      }
    };
  }
});
