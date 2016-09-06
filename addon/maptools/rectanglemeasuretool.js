import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({

  _layer: null,
  _measure: null,

  rectangleClose(e) {
    this.rectangleLayer.disableEdit();
    this.get('map').off('measure:created');
    this.rectangleLayer.remove();
  },

  rectangleMeasured(e) {
    this.rectangleLayer = e.layer;
    this.get('map').off('measure:created');
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
    this._measure = map.MeasureTools ? map.MeasureTools : L.measureBase(map);
    this._measure.rectangleBaseTool.startMeasure();
    this.get('map').on('measure:created', this.rectangleMeasured, this);
  },

  disable() {
    this._super(...arguments);
    var map = this.get('map');
    map.dragging.disable();
    this.rectangleClose();
    map.editTools.stopDrawing();
  },
});
