/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapTool from './base';

/**
  Rectangle map-tool.

  @class RectangleMapTool
  @extends BaseMapTool
*/
export default BaseMapTool.extend({
  /**
    Leaflet.Editable drawing tools instance.

    @property _editTools
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Ediatble</a>
    @default null
    @private
  */
  _editTools: null,

  /**
    Flag: indicates whether to hide rectangle on drawing end or not.

    @property hideRectangleOnDrawingEnd
    @type Boolean
    @default true
  */
  hideRectangleOnDrawingEnd: true,

  /**
    Handles map's 'editable:drawing:end' event.

    @method rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
  */
  _rectangleDrawingDidEnd({ layer }) {
    // Remove drawn rectangle.
    layer.disableEdit();

    if (this.get('hideRectangleOnDrawingEnd')) {
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

    let leafletMap = this.get('leafletMap');
    let editTools = this.get('_editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap, {
        drawingCursor: this.get('cursor')
      });
      this.set('_editTools', editTools);
    }

    editTools.on('editable:drawing:end', this._rectangleDrawingDidEnd, this);
    editTools.startRectangle();
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._super(...arguments);

    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      editTools.off('editable:drawing:end', this._rectangleDrawingDidEnd, this);
      editTools.stopDrawing();
    }
  },

  /**
    Destroys map-tool.
  */
  willDestroy() {
    this._super(...arguments);

    let editLayer = this.get('_editTools.editLayer');
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
      editLayer.remove();
    }

    let featuresLayer = this.get('_editTools.featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
      featuresLayer.remove();
    }

    this.set('_editTools', null);
  }
});
