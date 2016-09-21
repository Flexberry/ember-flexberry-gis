/**
  @module ember-flexberry-gis
*/

import RectangleMaptool from './rectangle';

/**
  Zoom out map tool.

  @class ZoomOutMaptool
  @extends RectangleMaptool
*/
export default RectangleMaptool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'zoom-out'
  */
  cursor: 'zoom-out',

  /**
    Handles map's 'editable:drawing:end' event.

    @method rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
  */
  rectangleDrawingDidEnd({ layer }) {
    this._super(...arguments);
    
    let leafletMap = this.get('map');
    let mapSize = leafletMap.getBounds();
    let zoomSize = layer.getBounds();

    let dx = (mapSize.getEast() - mapSize.getWest()) / (zoomSize.getEast() - zoomSize.getWest());
    let dy = (mapSize.getNorth() - mapSize.getSouth()) / (zoomSize.getNorth() - zoomSize.getSouth());
    let maxD = dx > dy ? dx : dy;

    let zoom = leafletMap.getScaleZoom(1 / maxD, leafletMap.getZoom());
    leafletMap.panTo(zoomSize.getCenter());
    leafletMap.setZoom(Math.floor(zoom));
  }
});
