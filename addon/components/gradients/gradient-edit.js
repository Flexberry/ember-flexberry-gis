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
    Injected param-gradient-service.

    @property _paramGradient
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:param-gradient
    @private
  */
  _paramGradient: Ember.inject.service('param-gradient'),

  /**
    Observes changes in Observes changes in the choice of gradient colors.
    Initializes area select color in flexberry-colorpicker.

    @method _gradientColorStartChange
    @private
  */
  _gradientColorStartChange: Ember.observer('gradientColorStart', 'gradientColorEnd', function() {
    Ember.run.once(this, '_gradientDrawing');
  }),

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
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onGradientColorEndChange
    */
    onGradientColorEndChange(e) {
      this.set('gradientColorEnd', e.newValue);
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let paramGrad = this.get('_paramGradient');
    let previewCanvas = Ember.$('.' + this.get('previewCanvasName'));
    paramGrad.gradientDrawing(previewCanvas, this.get('gradientColorStart'), this.get('gradientColorEnd'));
  },

  /**
    Gradient display.

    @method gradientDrawing
  */
  _gradientDrawing() {
    let paramGrad = this.get('_paramGradient');
    let previewCanvas = Ember.$('.' + this.get('previewCanvasName'));
    paramGrad.gradientDrawing(previewCanvas, this.get('gradientColorStart'), this.get('gradientColorEnd'));
  }
});
