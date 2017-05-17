/**
  @module ember-flexberry-gis
*/

import BaseMapTool from './base';

/**
  BaseNonclickable map-tool.

  @class BaseNonclickableMapTool
  @extends BaseMapTool
*/
export default BaseMapTool.extend({
  /**
    Leaflet map related to tool.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');

    // disable zoom on double click while tool is enabled
    if (leafletMap) {
      leafletMap.doubleClickZoom.disable();
    }
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._super(...arguments);

    // enable zoom on double click while tool is disabled
    let leafletMap = this.get('leafletMap');
    if (leafletMap) {
      // delayed activation because editable:drawing:end response is too late
      setTimeout(() => leafletMap.doubleClickZoom.enable(), 300);
    }
  }
});
