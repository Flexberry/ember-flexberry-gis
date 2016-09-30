/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DrawMapTool from './draw';

/**
  Draw clear map-tool.

  @class DrawClearMapTool
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

    let editLayer = this.get('_editTools.editLayer');
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
    }

    let featuresLayer = this.get('_editTools.featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
    }

    this.disable();
  }
});
