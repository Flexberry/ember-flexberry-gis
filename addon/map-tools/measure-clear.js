/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import MeasureMapTool from './measure';

/**
  Measure clear map-tool.

  @class MeasureClearMapTool
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

    let editLayer = this.get('_measureTools.options.editOptions.editLayer');
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
    }

    let featuresLayer = this.get('_measureTools.options.editOptions.featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
    }

    this.disable();
  }
});
