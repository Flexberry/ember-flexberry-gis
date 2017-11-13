/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-vector-layers-settings';

export default Ember.Component.extend({

  /**
    Reference to component's template.
  */
  layout,

  /**
    Vector layers settings.
  */
  settings: {

    /**
      Flag: indicates whether outline is shown or not.

      @property visibilityOutline
      @type Boolean
      @default true
    */
    visibilityOutline: true,

    /**
      Color outline.

      @property _colorOutline
      @type String
      @default '#000000'
    */
    colorOutline: '#000000',

    /**
      Defines thickness outline.

      @property _thicknessOutline
      @type Number
      @default 1
    */
    thicknessOutline: 1,

    /**
      Defines opacity outline.

      @property opacityOutline
      @type Number
      @default 1
    */
    opacityOutline: 1,

    /**
      Defines shape to be used at the end of the stroke.

      @property valueLineCap
      @type String
      @default 'round'
    */
    valueLineCap: 'round',

    /**
      Defines shape to be used at the corners of the stroke.

      @property valueLineJoin
      @type String
      @default 'round'
    */
    valueLineJoin: 'round',

    /**
      Defines the stroke dash pattern.

      @property valueDashArray
      @type []
      @default null
    */
    valueDashArray: null,

    /**
      Defines the distance into the dash pattern to start the dash.

      @property valueDashOffset
      @type Number
      @default null
    */
    valueDashOffset: null,

    /**
      Flag: indicates whether pouring is shown or not.

      @property visibilityPouring
      @type Boolean
      @default true
    */
    visibilityPouring: true,

    /**
      Color pouring.

      @property colorPouring
      @type String
      @default '#109bfc'
    */
    colorPouring: '#109bfc',

    /**
      Opacity pouring.

      @property opacityPouring
      @type Number
      @default 1
    */
    opacityPouring: 1,
  },

  /**
    Array of posible lineCap values.

    @property _itemsLineCap
    @type Array
    @default ['butt', 'round', 'square']
    @private
  */
  _itemsLineCap: Ember.A(['butt', 'round', 'square']),

  /**
    Array of posible lineJoin values.

    @property _itemsLineJoin
    @type Array
    @default ['miter', 'round', 'bevel']
    @private
  */
  _itemsLineJoin: Ember.A(['miter', 'round', 'bevel']),

  /**
    Array of posible dashArray values.

    @property _itemsDashArray
    @type Array
    @default ['null', '5, 5', '5, 10', '10, 5', '5, 1', '1, 5', '15, 10, 5', '15, 10, 5, 10', '15, 10, 5, 10, 15', '5, 5, 1, 5']
    @private
  */
  _itemsDashArray: Ember.A(['null', '5, 5', '5, 10', '10, 5', '5, 1', '1, 5', '15, 10, 5', '15, 10, 5, 10', '15, 10, 5, 10, 15', '5, 5, 1, 5']),

  /**
    Observes settings changes.

    @method _settingsChanges
    @private
  */
  _settingsChanges: Ember.observer('settings.visibilityOutline', 'settings.colorOutline', 'settings.thicknessOutline',
   'settings.opacityOutline', 'settings.valueLineCap', 'settings.valueLineJoin', 'settings.valueDashArray', 'settings.valueDashOffset',
   'settings.visibilityPouring', 'settings.colorPouring', 'settings.opacityPouring', function () {
    this._draw();
  }),

  actions: {

    /**
      Handler for outline font colorpicker's 'change' action.

      @method actions.onColorOutlineChange
      @param {Object} e Event object.
    */
    onColorOutlineChange(e) {
      this.set('settings.colorOutline', e.newValue);
    },

    /**
      Handler for outline flexberry-ddau-slider's 'change' action.

      @method actions.onOpacityOutlineChange
      @param {Object} e Event object.
    */
    onOpacityOutlineChange(e) {
      this.set('settings.opacityOutline', e.newValue);
    },

    /**
      Handler for pouring font colorpicker's 'change' action.

      @method actions.onColorPouringChange
      @param {Object} e Event object.
    */
    onColorPouringChange(e) {
      this.set('settings.colorPouring', e.newValue);
    },

    /**
      Handler for pouring flexberry-ddau-slider's 'change' action.

      @method actions.onOpacityPouringChange
      @param {Object} e Event object.
    */
    onOpacityPouringChange(e) {
      this.set('settings.opacityPouring', e.newValue);
    }
  },

  /**
    Draws in canvas vector layer settings.

    @method _draw
    @private
  */
  _draw() {
    let canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    let visibilityOutline = this.get('settings.visibilityOutline');
    let colorOutline = this.get('settings.colorOutline');
    let thicknessOutline = this.get('settings.thicknessOutline');
    let opacityOutline = this.get('settings.opacityOutline');
    let valueLineCap = this.get('settings.valueLineCap');
    let valueLineJoin = this.get('settings.valueLineJoin');
    let valueDashArray = this.get('settings.valueDashArray');
    let valueDashOffset = this.get('settings.valueDashOffset');

    let visibilityPouring = this.get('settings.visibilityPouring');
    let colorPouring = this.get('settings.colorPouring');
    let opacityPouring = this.get('settings.opacityPouring');

    // Cleaning the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setLineDash([]);
    if (valueDashArray !== null) {
      let valueDashArrayInt = valueDashArray.split(',').map(value => { return parseInt(value); });
      ctx.setLineDash(valueDashArrayInt);
      ctx.lineDashOffset = valueDashOffset;
    }

    // Draw the figure.
    ctx.moveTo(10, 40);
    ctx.lineTo(50, 20);
    ctx.lineTo(90, 30);
    ctx.lineTo(130, 10);
    ctx.lineTo(110, 70);
    ctx.lineTo(120, 100);
    ctx.lineTo(90, 120);
    ctx.lineTo(40, 110);
    ctx.closePath();

    ctx.moveTo(20, 130);
    ctx.lineTo(130, 130);

    // Pouring
    if (visibilityPouring) {
      ctx.globalAlpha = opacityPouring;
      ctx.fillStyle = colorPouring;
      ctx.fill();
    }

    // Outline
    if (visibilityOutline) {
      ctx.lineWidth = thicknessOutline;
      ctx.strokeStyle = colorOutline;
      ctx.lineJoin = valueLineJoin;
      ctx.lineCap = valueLineCap;
      ctx.globalAlpha = opacityOutline;
      ctx.stroke();
    }

    this.sendAction('sendSettings', this.get('settings'));
  },

  didInsertElement() {
    this._super(...arguments);
    this._draw();
  }
});
