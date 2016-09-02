import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({

  _layer: null,
  _measure: null,

  polylineClose(e) {
    this.polylineLayer.disableEdit();
    this.get('map').off('measure:created');
    this.polylineLayer.remove();
  },

  polylineMeasured(e) {
    this.polylineLayer = e.layer;
    //     e.layer.disableEdit();
    this.get('map').off('measure:created');
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
    this._measure = L.measureBase(map);
    this._measure.polylineBaseTool.startMeasure();
    this.get('map').on('measure:created', this.polylineMeasured, this);
  },

  disable() {
    this._super(...arguments);
    var map = this.get('map');
    map.dragging.disable();
    this.polylineClose();
    map.editTools.stopDrawing();
  },
});
