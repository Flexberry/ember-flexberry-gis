/**
  @module ember-flexberry-gis
*/

import RectangleMaptool from './rectangle';

/**
  Zoom in map tool.

  @class ZoomInMaptool
  @extends RectangleMaptool
*/
export default RectangleMaptool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'zoom-in'
  */
  cursor: 'zoom-in',

  /**
    Handles map's 'editable:drawing:end' event.

    @method rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
  */
  rectangleDrawingDidEnd({ layer }) {
    this._super(...arguments);

    let leafletMap = this.get('map');
    leafletMap.fitBounds(layer.getBounds());
  }
});
