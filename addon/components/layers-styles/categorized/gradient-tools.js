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
    Canvas name of preview stroke gradient.

    @property strokeGradientPreviewName
    @type String
    @default "strokeGradientCanvas"
    @public
  */
  strokeGradientPreview: 'strokeGradientCanvas',

  /**
    Canvas name of preview fill gradient.

    @property fillGradientPreviewName
    @type String
    @default "fillGradientCanvas"
    @public
  */
  fillGradientPreview: 'fillGradientCanvas',

  actions: {
    /**
      Handles on stroke gradient previewCanvas click event.

      @method actions.strokeGradientEditSwitch
    */
    strokeGradientEditSwitch() {
      this.toggleProperty('_showStrokeGradientEdit');
    },

    /**
      Handles on fill gradient previewCanvas click event.

      @method actions.fillGradientEditSwitch
    */
    fillGradientEditSwitch() {
      this.toggleProperty('_showFillGradientEdit');
    },

    /**
      Handles changes selected item in stroke gradien dropdown.

      @method actions.hideStrokeGradientEdit
    */
    hideStrokeGradientEdit() {
      this.set('_showStrokeGradientEdit', false);
    },

    /**
      Handles changes selected item in fill gradien dropdown.

      @method actions.hideFillGradientEdit
    */
    hideFillGradientEdit() {
      this.set('_showFillGradientEdit', false);
    }
  }
});
