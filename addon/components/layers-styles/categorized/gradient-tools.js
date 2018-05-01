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
    First stroke color of automatic set color gradient range. in HEX

    @property strokeGradientColorStart
    @type String
    @default null
    @public
  */
  strokeGradientColorStart: '#000',

  /**
    Last stroke color of automatic set color gradient range. in HEX

    @property strokeGradientColorEnd
    @type String
    @default null
    @public
  */
  strokeGradientColorEnd: '#FFF',

  /**
    First fill color of automatic set color gradient range. in HEX

    @property fillGradientColorStart
    @type String
    @default null
    @public
  */
  fillGradientColorStart: '#000',

  /**
    Last fill color of automatic set color gradient range. in HEX

    @property fillGradientColorStart
    @type String
    @default '#FFF'
    @public
  */
  fillGradientColorEnd: '#FFF',

  /**
    Canvas name of preview stroke gradient

    @property _strokeGradientPreviewName
    @type String
    @default "strokeGradientCanvas"
    @private
  */
  _strokeGradientPreview: 'strokeGradientCanvas',

  /**
    Canvas name of preview fill gradient

    @property _fillGradientPreviewName
    @type String
    @default "fillGradientCanvas"
    @private
  */
  _fillGradientPreview: 'fillGradientCanvas',

  /**
    Flag indicate stroke gradient enable

    @property _showStrokeGradientEdit
    @type Boolean
    @default false
    @private
  */
  _showStrokeGradientEdit: false,

  /**
    Flag indicate fill gradient enable

    @property _showFillGradientEdit
    @type Boolean
    @default false
    @private
  */
  _showFillGradientEdit: false,

  actions: {
    strokeGradientEditSwitch() {
      this.toggleProperty('_showStrokeGradientEdit');
    },

    fillGradientEditSwitch() {
      this.toggleProperty('_showFillGradientEdit');
    }
  }
});
