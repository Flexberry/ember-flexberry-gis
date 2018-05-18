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
  }
});
