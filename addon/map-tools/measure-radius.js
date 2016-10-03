/**
  @module ember-flexberry-gis
*/

import MeasureMapTool from './measure';

/**
  Measure radius map-tool.

  @class MeasureRadiusMapTool
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
    this.get('_measureTools').circleBaseTool.startMeasure();
  }
});
