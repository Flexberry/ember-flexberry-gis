/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-vector-layers-settings';

/**
  Сomponent for editing styles of vector layers.

  @class FlexberryVectorLayersSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({

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
    Reference to component's template.
  */
  layout,

  /**
    Vector layers settings.
  */
  settings: {

    /**
      Flag: indicates whether outline is shown or not.

      @property stroke
      @type Boolean
      @default true
    */
    stroke: true,

    /**
      Color outline.

      @property color
      @type String
      @default '#000000'
    */
    color: '#000000',

    /**
      Defines thickness outline.

      @property weight
      @type Number
      @default 1
    */
    weight: 1,

    /**
      Defines opacity outline.

      @property opacity
      @type Number
      @default 1
    */
    opacity: 1,

    /**
      Defines shape to be used at the end of the stroke.

      @property lineCap
      @type String
      @default 'round'
    */
    lineCap: 'round',

    /**
      Defines shape to be used at the corners of the stroke.

      @property lineJoin
      @type String
      @default 'round'
    */
    lineJoin: 'round',

    /**
      Defines the stroke dash pattern.

      @property dashArray
      @type []
      @default null
    */
    dashArray: null,

    /**
      Defines the distance into the dash pattern to start the dash.

      @property dashOffset
      @type Number
      @default null
    */
    dashOffset: null,

    /**
      Flag: indicates whether pouring is shown or not.

      @property fill
      @type Boolean
      @default true
    */
    fill: true,

    /**
      Color pouring.

      @property fillColor
      @type String
      @default '#109bfc'
    */
    fillColor: '#109bfc',

    /**
      Opacity pouring.

      @property fillOpacity
      @type Number
      @default 1
    */
    fillOpacity: 1,
  },

  /**
    Observes settings changes.

    @method _settingsChanges
    @private
  */
  _settingsChanges: Ember.observer('settings.stroke', 'settings.color', 'settings.weight',
   'settings.opacity', 'settings.lineCap', 'settings.lineJoin', 'settings.dashArray', 'settings.dashOffset',
   'settings.fill', 'settings.fillColor', 'settings.fillOpacity', function () {
    this._draw();
  }),

  actions: {

    /**
      Handler for outline font colorpicker's 'change' action.

      @method actions.onColorOutlineChange
      @param {Object} e Event object.
    */
    onColorOutlineChange(e) {
      this.set('settings.color', e.newValue);
    },

    /**
      Handler for outline flexberry-ddau-slider's 'change' action.

      @method actions.onOpacityOutlineChange
      @param {Object} e Event object.
    */
    onOpacityOutlineChange(e) {
      this.set('settings.opacity', e.newValue);
    },

    /**
      Handler for pouring font colorpicker's 'change' action.

      @method actions.onColorPouringChange
      @param {Object} e Event object.
    */
    onColorPouringChange(e) {
      this.set('settings.fillColor', e.newValue);
    },

    /**
      Handler for pouring flexberry-ddau-slider's 'change' action.

      @method actions.onOpacityPouringChange
      @param {Object} e Event object.
    */
    onOpacityPouringChange(e) {
      this.set('settings.fillOpacity', e.newValue);
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

    let visibilityOutline = this.get('settings.stroke');
    let colorOutline = this.get('settings.color');
    let thicknessOutline = this.get('settings.weight');
    let opacityOutline = this.get('settings.opacity');
    let valueLineCap = this.get('settings.lineCap');
    let valueLineJoin = this.get('settings.lineJoin');
    let valueDashArray = this.get('settings.dashArray');
    let valueDashOffset = this.get('settings.dashOffset');

    let visibilityPouring = this.get('settings.fill');
    let colorPouring = this.get('settings.fillColor');
    let opacityPouring = this.get('settings.fillOpacity');

    // Cleaning the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setLineDash([]);
    if (valueDashArray !== null && valueDashArray !== undefined) {
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

  /**
    Get color hex-code from given color name.

    @method _getHexFromName
    @param {String} colorName Color name.
    @private
  */
  _getHexFromName(colorName) {
    let name = colorName.toLowerCase();
    let hexName = name.toString();
    switch (name) {
      case 'black':
        hexName = '#000000';
      break;
      case 'blue':
        hexName = '#0000ff';
      break;
      case 'green':
        hexName = '#008000';
      break;
      case 'aqua':
        hexName = '#00ffff';
      break;
      case 'purple':
        hexName = '#800080';
      break;
      case 'gray':
        hexName = '#808080';
      break;
      case 'red':
        hexName = '#ff0000';
      break;
      case 'orange':
        hexName = '#ffa500';
      break;
      case 'pink':
        hexName = '#ffc0cb';
      break;
      case 'gold':
        hexName = '#ffd700';
      break;
      case 'snow':
        hexName = '#fffafa';
      break;
      case 'yellow':
        hexName = '#ffff00';
      break;
      case 'white':
        hexName = '#ffffff';
      break;
    }

    return hexName;
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let settings = this.get('settings');
    if (settings.stroke === undefined) {
      let hexColor = this._getHexFromName(settings.color);
      this.set('settings', {
        stroke: true,
        color: hexColor,
        weight: settings.weight,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: null,
        dashOffset: null,
        fill: true,
        fillColor: hexColor,
        fillOpacity: 0.2,
      });
    } else {
      this.set('settings', settings);
    }

  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    this._draw();
  }
});
