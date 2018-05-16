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

    @property _gradientList
    @type Object[]
    @default []
  */
  _gradientList: [],

  _customGradient: null,

  _customGradientName: 'custom',

  /**
    Reference to component's template.
  */
  layout,

  isGradientCustomized: Ember.observer('customGradientColorStart', 'customGradientColorEnd', function () {
    let colorStart = this.get('customGradientColorStart');
    let colorEnd = this.get('customGradientColorEnd');

    if (Ember.isNone(colorStart)) {
      colorStart = this.get('gradientColorStart');
    }

    if (Ember.isNone(colorEnd)) {
      colorEnd = this.get('gradientColorEnd');
    }

    this._showCustomGradientItem(colorStart, colorEnd);
  }),

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

  actions: {
    /**
      The handler for the selected value in dropdown.
      Invokes component's `#crossLink "gradient-tools/sendingActions.gradientChange:
      method"`'hideStrokeGradientEdit','hideFillGradientEdit' `/crossLink` action.

      @method actions.onChangeGradient
    */
    onChangeGradient(element, value) {
      let customGradientName = this.get('_customGradientName');
      if(value !== customGradientName) {
        let gradientColor = this.getColorGradient(value);
        this.gradientDrawing(gradientColor[0], gradientColor[1], gradientColor[2]);
        this.set('gradientColorStart', gradientColor[1]);
        this.set('gradientColorEnd', gradientColor[2]);
      }
    }

  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let owner = Ember.getOwner(this);
    let isGradients = owner.knownForType('gradient');
    for (let i in isGradients) {
      this.addGradientList(isGradients[i].name, isGradients[i].colorStart, isGradients[i].colorEnd);
    }

    let colorStart = this.get('gradientColorStart');
    let colorEnd = this.get('gradientColorEnd');

    if(Ember.isNone(colorStart) || Ember.isNone(colorEnd)) {
      Ember.run.scheduleOnce('afterRender', this, '_showDefaultItem');
    } else {
      Ember.run.scheduleOnce('afterRender', this, '_applyExistGradientSettings',colorStart,colorEnd);
    }

  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    let gradientList = this.get('_gradientList');
    for (let i in gradientList) {
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

  _showDefaultItem() {
    if (Ember.isNone(this.get('gradientColorStart')) && Ember.isNone(this.get('gradientColorEnd'))) {
      let gradientName = this.get('_gradientList')[0].name;
      this._showDropdownItem(gradientName);
    }
  },

  _showCustomGradientItem(colorStart, colorEnd) {
    let customGradientName = this.get('_customGradientName');
    let customGradient = { 'name': customGradientName, 'colorStart': colorStart, 'colorEnd': colorEnd}
    this.set('_customGradient',customGradient);
    this._showDropdownItem(customGradient.name);
    this.gradientDrawing(customGradient.name, customGradient.colorStart, customGradient.colorEnd);
  },

  _applyExistGradientSettings(colorStart, colorEnd) {
    let gradientList = this.get('_gradientList');
    let findedItemIdex = gradientList.findIndex((item) =>
      Ember.isEqual(item.colorStart, colorStart) &&
      Ember.isEqual(item.colorEnd, colorEnd)
    );
    if (findedItemIdex >=0) {
      let gradientListItem = this.get('_gradientList')[findedItemIdex];
      this._showDropdownItem(gradientListItem.name);
      this.gradientDrawing(gradientListItem.name, gradientListItem.colorStart, gradientListItem.colorEnd);
    } else {
      this._showCustomGradientItem(colorStart, colorEnd)
    }
  },

  _showDropdownItem(itemName) {
    Ember.run(() => {
      let gradientDropdown = this.$('.ui.dropdown');
      gradientDropdown.dropdown('set selected', itemName);
    });
  },

  /**
    Search for the start and end colors of the selected gradient.

    @method getColorGradient
    @param {String} search The name of the selected gradient.
    @returns Object[] color list gradient.
  */
  getColorGradient(search) {
    let colorsGradient = Ember.A([]);
    let gradientList = this.get('_gradientList');

    gradientList .forEach(function(item) {
      if (item.name === search) {
        colorsGradient.push(item.name, item.colorStart, item.colorEnd);
      }
    });

    return colorsGradient;
  },

  /**
    Add gradient to collection of object gradien list.

    @method addGradientList
    @param {String} name The name for gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
  */
  addGradientList(name, colorStart, colorEnd) {
    let gradientList = this.get('_gradientList');
    let existingGradientItem;

    if (!Ember.isNone(gradientList)) {
      for (let i in gradientList) {
        if (gradientList[i].name === name) {
          existingGradientItem = name;
        }
      }
    }

    if (Ember.isNone(existingGradientItem)) {
      gradientList.push({ 'name': name, 'colorStart': colorStart, 'colorEnd': colorEnd});
      this.set ('_gradientList', gradientList);
    }
  },

  /**
    Gradient display.

    @method gradientDrawing
    @param {String} classCanvas The canvas class to apply a gradient.
    @param {String} colorStart Initial Color.
    @param {String} colorEnd End color.
    @param {Boolean} editGradient Forms edit gradient.
  */
  gradientDrawing(canvasName, colorStart, colorEnd) {
    let dropdownCanvases = this.$('.' + canvasName);
    for (let i = 0; i < dropdownCanvases.length; i++) {
      let ctx = dropdownCanvases[i].getContext('2d');
      let w = dropdownCanvases[i].width;
      let h = dropdownCanvases[i].height;
      let grd = ctx.createLinearGradient(0, 0, w, 0);

      grd.addColorStop(0, colorStart);
      grd.addColorStop(1, colorEnd);

      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }
  }
});
