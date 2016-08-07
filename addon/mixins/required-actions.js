/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing logic which forces assertion exceptions
  if handlers for required actions are not defined.

  @class RequiredActionsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Component's required actions names.
    For actions enumerated in this array an assertion exceptions will be thrown,
    if actions handlers are not defined for them.

    @property _requiredActions
    @type String[]
    @default null
  */
  _requiredActionNames: null,

  /**
    Initializes required actions logic.
  */
  init() {
    this._super(...arguments);

    let originalSendAction = this.sendAction;
    Ember.assert(
      `Wrong type of \`sendAction\` propery: actual type is ${Ember.typeOf(originalSendAction)}, ` +
      `but \`function\` is expected.`,
      Ember.typeOf(originalSendAction) === 'function');

    // Override 'sendAction' method to add some custom logic.
    this.sendAction = (...args) => {
      // Call standard logic first (send action outside of the component).
      originalSendAction.apply(this, args);
      
      let actionName = args[0];
      let requiredActionNames = this.get('_requiredActionNames');
      Ember.assert(
        `Wrong type of parent component\`s \`_requiredActionNames\` propery: ` +
        `actual type is ${Ember.typeOf(requiredActionNames)}, but \`array\` is expected.`,
        Ember.isNone(requiredActionNames) || Ember.isArray(requiredActionNames));

      // If no required actions names defined, break custom 'sendAction' logic then.
      if (!Ember.isArray(requiredActionNames)) {
        return;
      }

      // Throw assertion failed exception, if action handler is not defined for required action.
      Ember.assert(
        `Handler for required \`${actionName}\` action is not defined in ${this}`,
        !Ember.A(requiredActionNames).contains(actionName) ||
        Ember.typeOf(this.get(`attrs.${actionName}`)) === 'function' ||
        Ember.typeOf(this.get(`attrs.${actionName}`)) === 'string' ||
        this.get(`_dynamicActions.${actionName}.length`) > 0 ||
        this.get(`_dynamicProxyActions.${actionName}.length`) > 0);
        
    };
  }
});
