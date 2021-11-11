/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';

import { scheduleOnce, later } from '@ember/runloop';
import { isNone, isEqual } from '@ember/utils';
import { observer } from '@ember/object';
import Component from '@ember/component';
import layout from '../../templates/components/gradients/dropdown-gradient';

/**
  Component for gradient editing.

  @class GradientEditComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Component.extend({
  /**
    Custom gradient element for dropdown list.

    @property _customGradient
    @type Object
    @default null
    @private
  */
  _customGradient: null,

  /**
    Name for custom gradient element in dropdown list.

    @property _customGradientName
    @type String
    @default 'custom'
    @private
  */
  _customGradientName: 'custom',

  /**
    Observes gradient customization from gradient-edit component.

    @method _isGradientCustomized
    @private
  */
  _isGradientCustomized: observer('customGradientColorStart', 'customGradientColorEnd', function () {
    let colorStart = this.get('customGradientColorStart');
    let colorEnd = this.get('customGradientColorEnd');

    if (isNone(colorStart)) {
      colorStart = this.get('gradientColorStart');
    }

    if (isNone(colorEnd)) {
      colorEnd = this.get('gradientColorEnd');
    }

    this._showCustomGradientItem(colorStart, colorEnd);
  }),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Inner hash containing settings gradient object.

    @property gradientList
    @type Object[]
    @default []
    @public
  */
  gradientList: [],

  /**
    Initial gradient color.

    @property gradientColorStart
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
    Initial gradient color.

    @property gradientColorStart
    @type string
    @default null
    @public
  */
  customGradientColorStart: null,

  /**
    The final color of the gradient.

    @property gradientColorEnd
    @type string
    @default null
    @public
  */
  customGradientColorEnd: null,

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

  /**
    Initializes component's DOM-related properties.
  */
    didInsertElement() {
      this._super(...arguments);
  
      const $dropdown = this.$().dropdown({
        onChange: (newValue) => {
          this.set('value', newValue);
          this.sendAction('change', newValue);
        },
      });
  
      const initialValue = this.get('value');
      if (!isBlank(initialValue)) {
        $dropdown.dropdown('set selected', initialValue);
      }
    },
  
    /**
      Deinitializes component's DOM-related properties.
    */
    willDestroyElement() {
      this._super(...arguments);
      this.$().dropdown('destroy');
    },

  actions: {
    /**
      The handler for the selected value in dropdown.
      Invokes component's `#crossLink "gradient-tools/sendingActions.gradientChange:
      method"`'hideStrokeGradientEdit','hideFillGradientEdit' `/crossLink` action.

      @method actions.onChangeGradient
    */
    onChangeGradient(element, value) {
      const customGradientName = this.get('_customGradientName');
      if (value !== customGradientName) {
        const gradientColor = this.getColorGradient(value);
        this.gradientDrawing(gradientColor[0], gradientColor[1], gradientColor[2]);
        this.set('gradientColorStart', gradientColor[1]);
        this.set('gradientColorEnd', gradientColor[2]);
      } else {
        const colorStart = this.get('customGradientColorStart');
        const colorEnd = this.get('customGradientColorEnd');
        this.set('gradientColorStart', colorStart);
        this.set('gradientColorEnd', colorEnd);
        this.gradientDrawing(customGradientName, colorStart, colorEnd);
      }
    },

  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    const colorStart = this.get('gradientColorStart');
    const colorEnd = this.get('gradientColorEnd');

    if (isNone(colorStart) || isNone(colorEnd)) {
      scheduleOnce('afterRender', this, '_showDefaultItem');
    } else {
      scheduleOnce('afterRender', this, '_applyExistGradientSettings', colorStart, colorEnd);
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    const gradientList = this.get('gradientList');
    for (const i in gradientList) {
      this.gradientDrawing(gradientList[i].name, gradientList[i].colorStart, gradientList[i].colorEnd);
    }
  },

  /**
    Clear colors start and stop values, when dropdown hide
  */
  willClearRender() {
    this._super(...arguments);
    this.set('gradientColorStart', null);
    this.set('gradientColorEnd', null);
    this.set('_customGradient', null);
  },

  /**
    Show first item in gradient dropdown as default

    @method _showDefaultItem
    @private
  */
  _showDefaultItem() {
    const gradientName = this.get('gradientList.0.name');
    const colorStart = this.get('gradientList.0.colorStart');
    const colorEnd = this.get('gradientList.0.colorEnd');
    this._showItem(gradientName, colorStart, colorEnd);
  },

  /**
    Show custom gradient item in dropdown when user change gradient in
    gradient-edit component

    @method _showCustomGradientItem
    @param {String} colorStart first color value in HEX
    @param {String} colorEnd last color value in HEX
    @private
  */
  _showCustomGradientItem(colorStart, colorEnd) {
    const customGradientName = this.get('_customGradientName');
    const customGradient = { name: customGradientName, colorStart, colorEnd, };
    this.set('_customGradient', customGradient);
    this._showItem(customGradient.name, customGradient.colorStart, customGradient.colorEnd);
  },

  /**
    Set selected any gradient item in dropdown by gradient name

    @method _showItem
    @param {String} itemName name of selectable item
    @param {String} colorStart first color value in HEX
    @param {String} colorEnd last color value in HEX
    @private
  */
  _showItem(itemName, colorStart, colorEnd) {
    later(() => {
      const gradientDropdown = this.$('.ui.dropdown');
      gradientDropdown.dropdown('set selected', itemName);
      this.gradientDrawing(itemName, colorStart, colorEnd);
    }, 100);
  },

  /**
    Apply existing gradient parameters on gradient-tools user interface form

    @method _applyExistGradientSettings
    @param {String} colorStart first color value in HEX
    @param {String} colorEnd last color value in HEX
    @private
  */
  _applyExistGradientSettings(colorStart, colorEnd) {
    const gradientList = this.get('gradientList');
    const findedItemIdex = gradientList.findIndex((item) => isEqual(item.colorStart, colorStart)
      && isEqual(item.colorEnd, colorEnd));
    if (findedItemIdex >= 0) {
      const gradientListItem = this.get('gradientList')[findedItemIdex];
      this._showItem(gradientListItem.name, gradientListItem.colorStart, gradientListItem.colorEnd);
    } else {
      this.set('customGradientColorStart', colorStart);
      this.set('customGradientColorEnd', colorEnd);
    }
  },

  /**
    Search for the start and end colors of the selected gradient.

    @method getColorGradient
    @param {String} search The name of the selected gradient.
    @returns Object[] color list gradient.
  */
  getColorGradient(search) {
    const colorsGradient = A([]);
    const gradientList = this.get('gradientList');

    gradientList.forEach(function (item) {
      if (item.name === search) {
        colorsGradient.push(item.name, item.colorStart, item.colorEnd);
      }
    });

    return colorsGradient;
  },

  /**
    Gradient display.

    @method gradientDrawing
    @param {String} classCanvas The canvas class to apply a gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
  */
  gradientDrawing(canvasName, colorStart, colorEnd) {
    const dropdownCanvases = this.$(`.${canvasName}`);
    for (let i = 0; i < dropdownCanvases.length; i++) {
      const ctx = dropdownCanvases[i].getContext('2d');
      const { width, } = dropdownCanvases[i];
      const { height, } = dropdownCanvases[i];
      const grd = ctx.createLinearGradient(0, 0, width, 0);

      grd.addColorStop(0, colorStart);
      grd.addColorStop(1, colorEnd);

      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    }
  },
});
