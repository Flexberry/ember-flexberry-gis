/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import layout from '../templates/components/flexberry-ddau-checkbox';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-checkbox').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-checkbox').
  @property {String} flexberryClassNames.checkboxInput Component's inner <input type="checkbox"> CSS-class name ('flexberry-checkbox-input').
  @property {String} flexberryClassNames.checkboxCaption Component's inner <label> CSS-class name ('flexberry-checkbox-caption').
  @readonly
  @static

  @for FlexberryDdauCheckboxComponent
*/
const flexberryClassNamesPrefix = 'flexberry-checkbox';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  checkboxInput: flexberryClassNamesPrefix + '-input',
  checkboxCaption: flexberryClassNamesPrefix + '-caption'
};

/**
  Flexberry checkbox component with [Semantic UI checkbox](http://semantic-ui.com/modules/checkbox.html) style
  and ["Data Down Actions UP (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way binding.
  Component doesn't mutate passed value by its own, it only invokes 'change' action,
  which signalizes to the route, controller, or another component, that passed value should be mutated.

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

      // Log jQuery 'change' event object triggered after checkbox input was clicked.
      console.log(e.originalEvent);
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
  @uses DynamicActionsMixin
*/
let FlexberryDdauCheckboxComponent = Ember.Component.extend(DynamicActionsMixin, {
  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-ddau-checkbox class="toggle" value=model.flag change=(action "onModelFlagChange")}}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-checkbox', 'ui', 'checkbox']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'checkbox'],

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
    Component's caption.

    @property caption
    @type String
    @default null
  */
  caption: null,

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
      Invokes component's {{#crossLink "FlexberryDdauCheckbox/sendingActions.change:method"}}'change'{{/crossLink}}, 
      {{#crossLink "FlexberryDdauCheckbox/sendingActions.check:method"}}'check'{{/crossLink}},
      {{#crossLink "FlexberryDdauCheckbox/sendingActions.uncheck:method"}}'uncheck'{{/crossLink}} actions.

      @method actions.onChange
      @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes inner input's 'change' event.
    */
    onChange(e) {
      let checked = e.target.checked === true;

      // Invoke component's custom 'change' action.
      this.sendAction('change', {
        newValue: checked,
        originalEvent: e
      });

      // Invoke state-related 'check' or 'uncheck' action.
      this.sendAction(checked ? 'check' : 'uncheck', {
        newValue: checked,
        originalEvent: e
      });

      // Prevent input's 'change' event bubbling,
      // otherwise component's 'change' action handler will be called twice
      // (one for invoked component's custom 'change' action,
      // and another for component's wrapping <div> bubbled 'change' event).
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

  /**
    Component's action invoking when checkbox was clicked and it's 'checked' state changed.

    @method sendingActions.change
    @param {Object} e Action's event object.
    @param {Boolean} e.newValue Component's new value.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes inner input's 'change' event.
  */

  /**
    Component's action invoking when checkbox was clicked and it's 'checked' state changed to 'checked=true'.

    @method sendingActions.check
    @param {Object} e Action's event object.
    @param {Boolean} e.newValue Component's new value (always true in this action handlers).
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes inner input's 'change' event.
  */

  /**
    Component's action invoking when checkbox was clicked and it's 'checked' state changed to 'checked=false'.

    @method sendingActions.uncheck
    @param {Object} e Action's event object.
    @param {Boolean} e.newValue Component's new value (always false in this action handlers).
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes inner input's 'change' event.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryDdauCheckboxComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryDdauCheckboxComponent;
