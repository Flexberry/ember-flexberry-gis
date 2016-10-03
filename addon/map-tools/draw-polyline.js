/**
  @module ember-flexberry-gis
*/

import DrawMapTool from './draw';

/**
  Draw polyline map-tool.

  @class DrawPolylineMapTool
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
    this.get('_editTools').startPolyline();
  }
});
