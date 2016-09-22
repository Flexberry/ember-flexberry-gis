/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMaptool from './base';

/**
  Rectangle map tool.

  @class RectangleMaptool
  @extends BaseMaptool
*/
export default BaseMaptool.extend({
  /**
    Handles map's 'editable:drawing:end' event.

    @method rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
  */
  rectangleDrawingDidEnd({ layer }) {
    // Remove drawn rectangle.
    layer.disableEdit();
    layer.remove();

    // Give to user ability to draw new rectangle.
    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      editTools.startRectangle();
    }
  },

  /**
    Enables tool.

    @method enable
  */
  enable() {
    this._super(...arguments);

    let leafletMap = this.get('map');

    // Leaflet.Editable has some problems if dragging is disabled.
    leafletMap.dragging.enable();

    let editTools = new L.Editable(leafletMap, {
      drawingCursor: this.get('cursor')
    });
    this.set('_editTools', editTools);

    leafletMap.on('editable:drawing:end', this.rectangleDrawingDidEnd, this);
    editTools.startRectangle();
  },

  /**
    Disables tool.

    @method disable
  */
  disable() {
    this._super(...arguments);

    let leafletMap = this.get('map');
    leafletMap.dragging.disable();
    leafletMap.off('editable:drawing:end', this.rectangleDrawingDidEnd, this);

    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      editTools.stopDrawing();
      this.set('_editTools', null);
    }
  }
});
