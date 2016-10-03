/**
  @module ember-flexberry-gis
*/

import MeasureMapTool from './measure';

/**
  Measure area map-tool.

  @class MeasureAreaMapTool
  @extends MeasureMapTool
*/
export default MeasureMapTool.extend({
  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    this.get('_measureTools').polygonBaseTool.startMeasure();
  }
});
