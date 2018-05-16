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
    Reference to component's template.
  */
  layout,

  /**
    The class name of preview canvas gradient.

    @property _previewCanvasName
    @type string
    @default 'null'
  */
  previewCanvasName: null,

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

  actions: {
    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onGradientColorStartChange
    */
    onGradientColorStartChange(e) {
      this.set('gradientColorStart', e.newValue);
      this.sendAction('onGradientEdited');
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onGradientColorEndChange
    */
    onGradientColorEndChange(e) {
      this.set('gradientColorEnd', e.newValue);
      this.sendAction('onGradientEdited');
    }
  }

});
