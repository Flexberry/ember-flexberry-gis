/**
  @module ember-flexberry-gis
*/

import DrawMapTool from './draw';

/**
  Draw circle map-tool.

  @class DrawCircleMapTool
  @extends DrawMapTool
*/
export default DrawMapTool.extend({
  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    this.get('_editTools').startCircle();
  }
});
