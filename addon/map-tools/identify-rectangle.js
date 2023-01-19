/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify';

/**
  Rectangle identify map-tool.

  @class RectangleIdentifyMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend({
  /**
    Handles map's 'editable:drawing:end' event.

    @method _drawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
  */
  _additionalDrawingDidEnd(layer) {
    this._super(...arguments);

    layer.disableEdit();

    // Remove drawn rectangle.
    if (this.get('hideOnDrawingEnd')) {
      layer.remove();
    }

    // Give to user ability to draw new rectangle.
    this.get('_editTools').startRectangle();
  },

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    this.get('_editTools').startRectangle();
  }
});
