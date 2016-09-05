import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({

  _layer: null,
  _measure: null,

  circleClose(e) {
    this.circleLayer.disableEdit();
    this.get('map').off('measure:created');
    this.circleLayer.remove();
  },

  circleMeasured(e) {
    this.circleLayer = e.layer;
    this.get('map').off('measure:created');
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
    this._measure = L.measureBase(map);
    this._measure.circleBaseTool.startMeasure();
    this.get('map').on('measure:created', this.circleMeasured, this);
  },

  disable() {
    this._super(...arguments);
    var map = this.get('map');
    map.dragging.disable();
    this.circleClose();
    map.editTools.stopDrawing();
  },

});
