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
    Inner hash containing settings gradient object.

    @property _isGradientList
    @type Object[]
    @default null
    @private
  */
  _isGradientList: null,

  /**
    Injected param-gradient-service.

    @property _paramGradient
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:param-gradient
    @private
  */
  _paramGradient: Ember.inject.service('param-gradient'),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Initial gradient color.

    @property _gradientColorStart
    @type string
    @default null
    @public
  */
  gradientColorStart: null,

  /**
    The final color of the gradient.

    @property gradientColorEnd
    @type string
    @default null
    @public
  */
  gradientColorEnd: null,

  /**
    The class name of preview canvas gradient.

    @property previewCanvasName
    @type string
    @default 'null'
    @public
  */
  previewCanvasName:null,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{feature-result-item class="my-class"}}
    ```

    @property classNames
    @type String[]
    @default ['gradient-edit', 'flexberry-colorpicker']
    @public
  */
  classNames: ['gradient-edit', 'flexberry-colorpicker'],

  actions: {
    /**
      The handler for the selected value in dropdown.
      Invokes component's `#crossLink "gradient-tools/sendingActions.gradientChange:
      method"`'hideStrokeGradientEdit','hideFillGradientEdit' `/crossLink` action.

      @method actions.onChangeGradient
    */
    onChangeGradient(element, value) {
      let paramGrad = this.get('_paramGradient');
      let gradientColor = this.getColorGradient(value);

      let dropdownCanvases = Ember.$('.' + gradientColor[0]);
      paramGrad.gradientDrawing(dropdownCanvases, gradientColor[1], gradientColor[2]);

      let previewCanvas = Ember.$('.' + this.get('previewCanvasName'));
      paramGrad.gradientDrawing(previewCanvas, gradientColor[1], gradientColor[2]);

      this.set('gradientColorStart', gradientColor[1]);
      this.set('gradientColorEnd', gradientColor[2]);
      this.sendAction('gradientChange');
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let paramGrad = this.get('_paramGradient');
    this.set('_isGradientList', paramGrad.getGradientList());
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    let paramGrad = this.get('_paramGradient');
    let isGradients = paramGrad.getGradientList();

    for (let i in isGradients) {
      let dropdownCanvas = Ember.$('.' + isGradients[i].canName);
      paramGrad.gradientDrawing(dropdownCanvas, isGradients[i].colorS, isGradients[i].colorE);
    }
  },

  /**
    Initializes component when it show. Set firs dropdown item
    as default checked element if element not checked
  */
  didRender() {
    this._super(...arguments);

    if (Ember.isNone(this.get('gradientColorStart')) && Ember.isNone(this.get('gradientColorEnd'))) {
      Ember.run(() => {
        let dropdown = this.$('.ui.dropdown');
        dropdown.dropdown('set selected', this.get('_isGradientList')[0].name);
      });
    }
  },

  /**
    Clear colors start and stop values, when dropdown hide
  */
  willClearRender() {
    this._super(...arguments);
    this.set('gradientColorStart', null);
    this.set('gradientColorEnd', null);
  },

  /**
    Search for the start and end colors of the selected gradient.

    @method getColorGradient
    @param {String} search The name of the selected gradient.
    @returns Object[] color list gradient.
  */
  getColorGradient(search) {
    let colorsGradient = Ember.A([]);
    let paramGrad = this.get('_paramGradient');
    let isGradients = paramGrad.getGradientList();

    isGradients.forEach(function(item) {
      if (item.name === search) {
        colorsGradient.push(item.canName, item.colorS, item.colorE);
      }
    });

    return colorsGradient;
  }

  /**
    Component's action invoking when in gradient dropdown change selected item.

    @method sendingActions.gradientChange
  */
});
