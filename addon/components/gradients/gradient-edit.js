/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/gradients/gradient-edit';

/**
  Component for gradient editing.

  @class GradientEditComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Ember.Component.extend({

  /**
    Initial gradient color.

    @property _gradientColorStart
    @type string
    @default null
  */
  gradientColorStart: null,

  /**
    The final color of the gradient.

    @property gradientColorEnd
    @type string
    @default null
  */
  gradientColorEnd: null,

  /**
    Gradient start color picker class.

    @property gradientStartPickerClass
    @type string
    @default 'gradient-start-picker'
  */
  gradientStartPickerClass: 'gradient-start-picker',

  /**
    Gradient end color picker class.

    @property gradientEndPickerClass
    @type string
    @default 'gradient-end-picker'
  */
  gradientEndPickerClass: 'gradient-end-picker',

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{feature-result-item class="my-class"}}
    ```

    @property classNames
    @type String[]
    @default ['gradient-edit']
  */
  classNames: ['gradient-edit'],

  /**
    Observes gradient color start changes.

    @method gradientColorStartObserver
  */
  gradientColorStartObserver: Ember.observer('gradientColorStart', function() {
    let startPickerClass = this.get('gradientStartPickerClass');
    let gradientColorStart = this.get('gradientColorStart');
    this.$(`.${startPickerClass} input`).minicolors('value', { color: gradientColorStart });
  }),

  /**
    Observes gradient color end changes.

    @method gradientColorEndObserver
  */
  gradientColorEndObserver: Ember.observer('gradientColorEnd', function() {
    let endPickerClass = this.get('gradientEndPickerClass');
    let gradientColorEnd = this.get('gradientColorEnd');
    this.$(`.${endPickerClass} input`).minicolors('value', { color: gradientColorEnd });
  }),

  actions: {
    /**
      Handler for colorpicker's 'change' action.

      @method actions.onGradientColorStartChange
    */
    onGradientColorStartChange(e) {
      this.set('gradientColorStart', e.newValue);
      this.sendAction('onGradientEdited');
    },

    /**
      Handler for colorpicker's 'change' action.

      @method actions.onGradientColorEndChange
    */
    onGradientColorEndChange(e) {
      this.set('gradientColorEnd', e.newValue);
      this.sendAction('onGradientEdited');
    }
  }

  /**
    Gradient-tool component's action invoking when gradient edit .

    @method sendingActions.onGradientEdited
  */
});
