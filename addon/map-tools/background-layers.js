/**
  @module ember-flexberry-gis
*/

import BaseMapTool from './base';

/**
  Drag map-tool.

  @class DragMapTool
  @extends BaseMapTool
*/
export default BaseMapTool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default ''
  */
  cursor: '',

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._super(...arguments);
  }
});
