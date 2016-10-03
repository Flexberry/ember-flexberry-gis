/**
  @module ember-flexberry-gis
*/

import DrawMapTool from './draw';

/**
  Draw polygon map-tool.

  @class DrawPolygonMapTool
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
    this.get('_editTools').startPolygon();
  }
});
