/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/gradients/dropdown-gradient';

/**
  Component for gradient editing.

  @class GradientEditComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Ember.Component.extend({
  /**
      Reference to component's template.
  */
  layout,

  /**
    Inner hash containing settings gradient object.
    @property _isGradientList
    @type Object[]
    @default null
  */
  _isGradientList: null,

  /**
    Initial gradient color.
    @property _gradientColorStart
    @type string
    @default null
  */
  _gradientColorStart: null,

  /**
    The final color of the gradient.
    @property _gradientColorEnd
    @type string
    @default null
  */
  _gradientColorEnd: null,

  /**
    The class name of preview canvas gradient.
    @property _previewCanvasName
    @type string
    @default 'null'
  */
  _previewCanvasName:null,

  /**
    Injected param-gradient-service.

    @property service
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:param-gradient
  */
  service: Ember.inject.service('param-gradient'),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let paramGrad = this.get('service');
    this.set('_isGradientList', paramGrad.getGradientList());
  },

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{feature-result-item class="my-class"}}
    ```

    @property classNames
    @type String[]
    @default ['gradient-edit', 'flexberry-colorpicker']
  */
  classNames: ['gradient-edit', 'flexberry-colorpicker'],

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    let paramGrad = this.get('service');
    let isGradients = paramGrad.getGradientList();

    for (let i in isGradients)
    {
      paramGrad.gradientDrawing(isGradients[i].canName, isGradients[i].colorS, isGradients[i].colorE);
    }
  },

  /**
    Search for the start and end colors of the selected gradient.

    @method getColorGradient
    @param {String} search The name of the selected gradient.
    @returns Object[] color list gradient.
  */
  getColorGradient(search) {
    let colorsGradient = Ember.A([]);
    let paramGrad = this.get('service');
    let isGradients = paramGrad.getGradientList();

    isGradients.forEach(function(item) {
      if (item.name === search) {
        colorsGradient.push(item.canName, item.colorS, item.colorE);
      }
    });

    return colorsGradient;
  },

  /**
    Initializes component when it show. Set firs dropdown item
    as default checked element if element not checked
  */

  didRender() {
    this._super(...arguments);
    if (Ember.isNone(this.get('_gradientColorStart')) && Ember.isNone(this.get('_gradientColorEnd'))) {
      let dropdown = this.$('.ui.dropdown');
      dropdown.dropdown('set selected', this.get('_isGradientList')[0].name);
    }
  },

  /**
    Clear colors start and stop values, when dropdown hide
  */

  willClearRender() {
    this._super(...arguments);
    this.set('_gradientColorStart',null);
    this.set('_gradientColorEnd',null);
  },

  actions: {
    /**
      The handler for the selected value in dropdown.

      @method actions.onChangeGradient
    */
    onChangeGradient(element, value) {
      let paramGrad = this.get('service');
      let gradientColor = this.getColorGradient(value);
      paramGrad.gradientDrawing(gradientColor[0], gradientColor[1], gradientColor[2]);
      paramGrad.gradientDrawing(this.get('_previewCanvasName'), gradientColor[1], gradientColor[2]);

      this.set('_gradientColorStart', gradientColor[1]);
      this.set('_gradientColorEnd', gradientColor[2]);
    }
  }
});
