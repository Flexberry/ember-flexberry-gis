/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify';

/**
  Polyline identify map-tool.

  @class PolylineIdentifyMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend({
  /**
    Handles map's 'editable:drawing:end' event.

    @method _drawingDidEnd
    @param {Object} e Event object.
    @param {<a href="https://leafletjs.com/reference-1.3.0.html#polyline">L.Polyline</a>} e.layer Drawn polyline layer.
  */
  _additionalDrawingDidEnd(layer) {
    this._super(...arguments);

    layer.disableEdit();

    // Remove drawn polyline.
    if (this.get('hideOnDrawingEnd')) {
      layer.remove();
    }

    // Give to user ability to draw new polyline.
    this.get('_editTools').startPolyline();
  },

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
