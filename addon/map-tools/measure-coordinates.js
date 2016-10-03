/**
  @module ember-flexberry-gis
*/

import MeasureMapTool from './measure';

/**
  Measure coordinates map-tool.

  @class MeasureCoordinatesMapTool
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
    this.get('_measureTools').markerBaseTool.startMeasure();
  }
});
