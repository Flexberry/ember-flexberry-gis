/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-styles/categorized/gradient-tools';

/**
  Component containing GUI for automatic set categorized layers-styles colors from gradient range

  @class CategorizedLayersStyleGradientToolsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Injected param-gradient-service.

    @property service
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:param-gradient
  */
  paramGradient: Ember.inject.service('param-gradient'),

  /**
    Flag indicates when stroke gradient enable.

    @property strokeGradientEnable
    @type Boolean
    @default false
    @public
  */
  strokeGradientEnable: false,

  /**
    Flag indicates when fill gradient enable.

    @property fillGradientEnable
    @type Boolean
    @default false
    @public
  */
  fillGradientEnable: false,

  /**
    First stroke color of automatic set color gradient range. In HEX.

    @property strokeGradientColorStart
    @type String
    @default null
    @public
  */
  strokeGradientColorStart: null,

  /**
    Last stroke color of automatic set color gradient range. In HEX.

    @property strokeGradientColorEnd
    @type String
    @default null
    @public
  */
  strokeGradientColorEnd: null,

  /**
    First fill color of automatic set color gradient range. In HEX.

    @property fillGradientColorStart
    @type String
    @default null
    @public
  */
  fillGradientColorStart: null,

  /**
    Last fill color of automatic set color gradient range. In HEX.

    @property fillGradientColorStart
    @type String
    @default null
    @public
  */
  fillGradientColorEnd: null,

  /**
    First stroke custom color of automatic set color gradient range. In HEX.

    @property customStrokeGradientColorStart
    @type String
    @default null
    @public
  */
  customStrokeGradientColorStart: null,

  /**
    Last stroke custom color of automatic set color gradient range. In HEX.

    @property customStrokeGradientColorEnd
    @type String
    @default null
    @public
  */
  customStrokeGradientColorEnd: null,

  /**
    First fill custom color of automatic set color gradient range. In HEX.

    @property customFillGradientColorStart
    @type String
    @default null
    @public
  */
  customFillGradientColorStart: null,

  /**
    Last fill custom color of automatic set color gradient range. In HEX.

    @property customFillGradientColorEnd
    @type String
    @default null
    @public
  */
  customFillGradientColorEnd: null,

  /**
    Inner hash containing settings gradient object.

    @property gradientList
    @type Object[]
    @default []
    @public
  */
  gradientList: [],

  actions: {
    /**
      Handles on fill gradient edit by gradient-edit.

      @method actions.onFillGradientEdited
    */
    onFillGradientEdited() {
      let colorStart = this.get('fillGradientColorStart');
      this.set('customFillGradientColorStart', colorStart);

      let colorEnd = this.get('fillGradientColorEnd');
      this.set('customFillGradientColorEnd', colorEnd);
    },

    /**
      Handles on stroke gradient edit by gradient-edit.

      @method actions.onStrokeGradientEdited
    */
    onStrokeGradientEdited() {
      let colorStart = this.get('strokeGradientColorStart');
      this.set('customStrokeGradientColorStart', colorStart);

      let colorEnd = this.get('strokeGradientColorEnd');
      this.set('customStrokeGradientColorEnd', colorEnd);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let paramGradient = this.get('paramGradient');
    let listOfGradients = paramGradient.getGradientList();
    this.set('gradientList', listOfGradients);
  }
});
