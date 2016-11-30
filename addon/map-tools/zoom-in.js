/**
  @module ember-flexberry-gis
*/

import RectangleMapTool from './rectangle';

/**
  Zoom in map-tool.

  @class ZoomInMapTool
  @extends RectangleMapTool
*/
export default RectangleMapTool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'zoom-in'
  */
  cursor: 'zoom-in',

  /**
    Handles map's 'editable:drawing:end' event.

    @method _rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
    @private
  */
  _rectangleDrawingDidEnd({ layer }) {
    this._super(...arguments);
    let bounds = layer.getBounds();
    let leafletMap = this.get('leafletMap');
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      let zoom = leafletMap.getZoom() + 1;
      leafletMap.setView(bounds.getNorthEast(), zoom);
    } else {
      leafletMap.fitBounds(layer.getBounds());
    }
  }
});
