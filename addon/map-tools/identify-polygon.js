/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify';

/**
  Polygon identify map-tool.

  @class PolygonIdentifyMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend({
  /**
    Handles map's 'editable:drawing:end' event.

    @method _drawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#polygon">L.Polygon</a>} e.layer Drawn polygon layer.
  */
  _additionalDrawingDidEnd(layer) {
    this._super(...arguments);

    layer.disableEdit();

    // Remove drawn polygon.
    if (this.get('hideOnDrawingEnd')) {
      layer.remove();
    }

    // Give to user ability to draw new polygon.
    this.get('_editTools').startPolygon();
  },

  _drawingStart(e) {
    let first = e.layer.getLatLngs().length === 1 && e.layer.getLatLngs()[0].length === 0;

    if (this.get('hidePreviousOnDrawingStart') && first) {
      this._clearPolygonLayer();
    }
  },

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    this.get('_editTools').startPolygon();
  }
});
