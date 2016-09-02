import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({

  _layer: null,
  _measure: null,

  rectangleStarted({ layer }) {
    layer.disableEdit();
    layer.remove();
    this._drawRectangle();
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
//     map.editTools = new L.Editable(this.get('map'), { drawingCursor: this.get('cursor') });
    this._measure = L.measureBase(map);
    this._measure.circleBaseTool.startMeasure();

//     let editTools = new L.Editable(this.get('map'), { drawingCursor: this.get('cursor') });
//     this.set('_editTools', editTools);
//     this.get('map').on('editable:drawing:end', this.rectangleStarted, this);
//     this._drawRectangle();
  },

  disable() {
    this._super(...arguments);
    this.get('map').dragging.disable();
    this.get('map').off('editable:drawing:end', this.rectangleStarted, this);
    this.get('_editTools').stopDrawing();
  },

  _drawRectangle() {
    this.get('_editTools').startRectangle();
  }
});
