/**
  @module ember-flexberry-gis
*/

import BaseMaptool from './base';

/**
  Drag map tool.

  @class DragMaptool
  @extends BaseMaptool
*/
export default BaseMaptool.extend({
  /**
    Enables tool.

    @method enable
  */
  enable() {
    this._super(...arguments);

    let leafletMap = this.get('map');
    leafletMap.dragging.enable();
  },

  /**
    Disables tool.

    @method disable
  */
  disable() {
    this._super(...arguments);

    let leafletMap = this.get('map');
    leafletMap.dragging.disable();
  }
});
