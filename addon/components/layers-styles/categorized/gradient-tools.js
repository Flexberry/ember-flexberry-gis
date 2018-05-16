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
    Flag indicate stroke gradient enable

    @property _showStrokeGradientEdit
    @type Boolean
    @default false
    @private
  */
  _showStrokeGradientEdit: false,

  /**
    Flag indicate fill gradient enable.

    @property _showFillGradientEdit
    @type Boolean
    @default false
    @private
  */
  _showFillGradientEdit: false,

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
    First stroke color of automatic set color gradient range. In HEX.

    @property strokeGradientColorStart
    @type String
    @default null
    @public
  */
  editStrokeGradientColorStart: null,

  /**
    Last stroke color of automatic set color gradient range. In HEX.

    @property strokeGradientColorEnd
    @type String
    @default null
    @public
  */
  editStrokeGradientColorEnd: null,

  /**
    First fill color of automatic set color gradient range. In HEX.

    @property fillGradientColorStart
    @type String
    @default null
    @public
  */
  editFillGradientColorStart: null,

  /**
    Last fill color of automatic set color gradient range. In HEX.

    @property fillGradientColorStart
    @type String
    @default null
    @public
  */
  editFillGradientColorEnd: null,

  actions: {

    onGradientChange() {
      this.sendAction('gradientChange');
    },

    /**
      Handles on fill gradient previewCanvas click event.

      @method actions.fillGradientEditSwitch
    */
    onFillGradientEdited() {
      let colorStart = this.get('fillGradientColorStart');
      this.set('customFillGradientColorStart',colorStart);

      let colorEnd = this.get('fillGradientColorEnd');
      this.set('customFillGradientColorEnd',colorEnd);
    },

    /**
      Handles on fill gradient previewCanvas click event.

      @method actions.fillGradientEditSwitch
    */
    onStrokeGradientEdited() {
      let colorStart = this.get('strokeGradientColorStart');
      this.set('customStrokeGradientColorStart',colorStart);

      let colorEnd = this.get('strokeGradientColorEnd');
      this.set('customStrokeGradientColorEnd',colorEnd);
    }
  }
});
