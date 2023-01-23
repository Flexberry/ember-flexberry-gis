/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify';

/**
  Marker identify map-tool.

  @class MarkerIdentifyMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend({
  /**
    Handles map's 'editable:drawing:end' event.

    @method _drawingDidEnd
    @param {Object} e Event object.
    @param {<a href="https://leafletjs.com/reference-1.3.0.html#point">L.Point</a>} e.layer Drawn marker layer.
  */
  _additionalDrawingDidEnd(layer) {
    this._super(...arguments);

    layer.disableEdit();

    // Remove drawn marker.
    if (this.get('hideOnDrawingEnd')) {
      layer.remove();
    }

    // Give to user ability to draw new marker.
    this.get('_editTools').startMarker();
  },

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    this.get('_editTools').startMarker();
  }
});
