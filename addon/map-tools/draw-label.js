/**
  @module ember-flexberry-gis
*/

import DrawMapTool from './draw';

/**
  Draw label map-tool.

  @class DrawLabelMapTool
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
    var myIcon = L.divIcon({className: 'flexberry-draw-marker-map-tool'});
    this.get('_editTools').startMarker(undefined, {icon: myIcon});
  }
});
