/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';
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
    if (!isNone(editLayer)) {
      editLayer.clearLayers();
    }

    let featuresLayer = this.get('_editTools.featuresLayer');
    if (!isNone(featuresLayer)) {
      featuresLayer.clearLayers();
    }

    this.disable();
  }
});
