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
    Flag: indicates whether outline is shown or not.

    @property _visibilityOutline
    @type Boolean
    @default true
    @private
  */
  _visibilityOutline: true,

  /**
    Color outline.

    @property _colorOutline
    @type String
    @default '#000000'
    @private
  */
  _colorOutline: '#000000',

  /**
    Defines thickness outline.

    @property _thicknessOutline
    @type Number
    @default 1
    @private
  */
  _thicknessOutline: 1,

  /**
    Defines opacity outline.

    @property _opacityOutline
    @type Number
    @default 1
    @private
  */
  _opacityOutline: 1,

  /**
    Array of posible lineCap values.

    @property _itemsLineCap
    @type Array
    @default ['butt', 'round', 'square']
    @private
  */
  _itemsLineCap: Ember.A(['butt', 'round', 'square']),

  /**
    Defines shape to be used at the end of the stroke.

    @property _valueLineCap
    @type String
    @default 'round'
    @private
  */
  _valueLineCap: 'round',

  /**
    Array of posible lineJoin values.

    @property _itemsLineJoin
    @type Array
    @default ['miter', 'round', 'bevel']
    @private
  */
  _itemsLineJoin: Ember.A(['miter', 'round', 'bevel']),

  /**
    Defines shape to be used at the corners of the stroke.

    @property _valueLineJoin
    @type String
    @default 'round'
    @private
  */
  _valueLineJoin: 'round',

  /**
    Array of posible dashArray values.

    @property _itemsDashArray
    @type Array
    @default ['5, 5', '5, 10', '10, 5', '5, 1', '1, 5', '15, 10, 5', '15, 10, 5, 10', '15, 10, 5, 10, 15', '5, 5, 1, 5']
    @private
  */
  _itemsDashArray: Ember.A(['5, 5', '5, 10', '10, 5', '5, 1', '1, 5', '15, 10, 5', '15, 10, 5, 10', '15, 10, 5, 10, 15', '5, 5, 1, 5']),

  /**
    Defines the stroke dash pattern.

    @property _valueDashArray
    @type []
    @default null
    @private
  */
  _valueDashArray: null,

  /**
    Defines the distance into the dash pattern to start the dash.

    @property _valueDashOffset
    @type Number
    @default null
    @private
  */
  _valueDashOffset: null,

  /**
    Flag: indicates whether pouring is shown or not.

    @property _visibilityPouring
    @type Boolean
    @default true
    @private
  */
  _visibilityPouring: true,

  /**
    Color pouring.

    @property _colorPouring
    @type String
    @default '#109bfc'
    @private
  */
  _colorPouring: '#109bfc',

  /**
    Opacity pouring.

    @property _opacityPouring
    @type Number
    @default 1
    @private
  */
  _opacityPouring: 1,

  /**
    Observes settings changes.

    @method _settingsChanges
    @private
  */
  _settingsChanges: Ember.observer('_visibilityOutline', '_colorOutline', '_thicknessOutline',
   '_opacityOutline', '_valueLineCap', '_valueLineJoin', '_valueDashArray', '_valueDashOffset',
   '_visibilityPouring', '_colorPouring', '_opacityPouring', function () {
    this._draw();
  }),

  actions: {

    /**
      Handler for outline font colorpicker's 'change' action.

      @method actions.onColorOutlineChange
      @param {Object} e Event object.
    */
    onColorOutlineChange(e) {
      this.set('_colorOutline', e.newValue);
    },

    /**
      Handler for outline flexberry-ddau-slider's 'change' action.

      @method actions.onOpacityOutlineChange
      @param {Object} e Event object.
    */
    onOpacityOutlineChange(e) {
      this.set('_opacityOutline', e.newValue);
    },

    /**
      Handler for pouring font colorpicker's 'change' action.

      @method actions.onColorPouringChange
      @param {Object} e Event object.
    */
    onColorPouringChange(e) {
      this.set('_colorPouring', e.newValue);
    },

    /**
      Handler for pouring flexberry-ddau-slider's 'change' action.

      @method actions.onOpacityPouringChange
      @param {Object} e Event object.
    */
    onOpacityPouringChange(e) {
      this.set('_opacityPouring', e.newValue);
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

    let visibilityOutline = this.get('_visibilityOutline');
    let colorOutline = this.get('_colorOutline');
    let thicknessOutline = this.get('_thicknessOutline');
    let opacityOutline = this.get('_opacityOutline');
    let valueLineCap = this.get('_valueLineCap');
    let valueLineJoin = this.get('_valueLineJoin');
    let valueDashArray = this.get('_valueDashArray');
    let valueDashOffset = this.get('_valueDashOffset');

    let visibilityPouring = this.get('_visibilityPouring');
    let colorPouring = this.get('_colorPouring');
    let opacityPouring = this.get('_opacityPouring');

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
  },

  didInsertElement() {
    this._super(...arguments);
    this._draw();
  }
});
