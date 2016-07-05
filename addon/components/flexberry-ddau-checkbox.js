/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-ddau-checkbox';
import { InvokeActionMixin } from 'ember-invoke-action';

/**
  Checkbox component with Semantic UI style and "Data Down Actions UP (DDAU)" pattern one way binding.
  Component doesn't mutate passed value by its own, it only invokes 'change' action,
  which signalizes to the route, controller, or another component, that passed value should be mutated.
  See a [paper](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) about DDAU pattern.
  See Semantic UI checkbox [documentation](http://semantic-ui.com/modules/checkbox.html).

  Usage with manual 'change' action handling:
  templates/my-form.hbs
  ```handlebars
  {{flexberry-ddau-checkbox value=model.flag change=(action "onModelFlagChange")}}
  ```

  controllers/my-form.js
  ```javascript
  actions: {
    onModelFlagChange(e) {
      // Set new value to model's 'flag' property.
      this.set('model.flag', e.newValue);

      // Log jQuery 'change' event triggered after checkbox input was clicked.
      console.log(e.event);
    }
  }
  ```

  Usage with {{#crossLink "FlexberryDdauCheckboxActionsHandlerMixin"}}flexberry-ddau-checkbox-actions-handler mixin{{/crossLink}}:
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

  @class FlexberryDdauCheckboxComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/martndemus/ember-invoke-action#mixin-usage">InvokeActionMixin</a>
*/
export default Ember.Component.extend(InvokeActionMixin, {
  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS classes names.

    Any other names can be added through conponent's 'class' property.
    ```handlebars
    {{flexberry-ddau-checkbox class="toggle" value=model.flag change=(action "onModelFlagChange")}}
    ```

    @property classNames
    @type String[]
    @default ['ui', 'checkbox']
  */
  classNames: ['ui', 'checkbox'],

  /**
    Components class names bindings.

    @property classNameBindings
    @type String[]
    @default ['value:checked', 'readonly:read-only']
  */
  classNameBindings: ['value:checked', 'readonly:read-only'],

  /**
    Component's value (if true, then checkbox is checked).

    @property value
    @type Boolean
    @default false
   */
  value: false,

  /**
    Component's label.

    @property label
    @type String
    @default null
  */
  label: null,

  /**
    Flag: indicates whether component is in readonly mode.

    @property readonly
    @type Boolean
    @default false
   */
  readonly: false,

  actions: {
    /**
      Handles checkbox input's 'change' action.
      Invokes component's 'change', 'check', 'uncheck' actions.

      @method actions.onChange
      @param {Object} e Inner checkbox input's 'change' [event object](http://api.jquery.com/category/events/event-object/).
    */
    onChange(e) {
      let checked = e.target.checked;

      // Invoke common 'change' action.
      this.invokeAction('change', {
        newValue: checked,
        event: e
      });

      // Invoke state-related 'check' or 'uncheck' action.
      this.invokeAction(checked ? 'check' : 'uncheck', {
        newValue: checked,
        event: e
      });

      // Return false to prevent input's 'change' event bubbling.
      return false;
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI checkbox.
    this.$().checkbox();
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    // Destroys Semantic UI checkbox.
    this.$().checkbox('destroy');
  }
});
