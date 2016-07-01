/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryDdauCheckboxComponent"}}flexberry-ddau-checkbox component's{{/crossLink}} actions.

  @class FlexberryDdauCheckboxActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  actions: {
    /**
      Handles {{#crossLink "FlexberryDdauCheckboxComponent"}}flexberry-ddau-checkbox component's{{/crossLink}}
      'change' action.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onCheckboxChange
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.event Inner checkbox input's 'change' [event object](http://api.jquery.com/category/events/event-object/).

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-ddau-checkbox value=model.flag change=(action "onCheckboxChange" "model.flag")}}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-ddau-checkbox-actions-handler';

        export default Ember.Controller.extend(FlexberryDdauCheckboxActionsHandlerMixin, {
        });
      ```
    */
    onCheckboxChange(...args) {
      // User can pass any additional arguments to action handler,
      // so original action's event object will be the last one in arguments array.
      let mutablePropertyPath = args[0];
      let e = args[args.length - 1];

      let mutablePropertyPathType = Ember.typeOf(mutablePropertyPath);
      if (mutablePropertyPathType === 'string') {
        this.set(mutablePropertyPath, e.newValue);
      } else {
        Ember.Logger.error(
          `Wrong type of \`onCheckboxChange\` \`mutablePropertyPath\` argument: \`${mutablePropertyPathType}\`. ` +
          `Allowed type is \`string\``);
      }
    }
  }
});
