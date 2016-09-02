import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({

  _layer: null,
  _measure: null,

  markerClose(e) {
    this.markerLayer.disableEdit();
    this.get('map').off('measure:created');
    this.markerLayer.remove();
  },

  markerMeasured(e) {
    this.markerLayer = e.layer;
//     e.layer.disableEdit();
    this.get('map').off('measure:created');
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
    this._measure = L.measureBase(map);
    this._measure.markerBaseTool.startMeasure();
    this.get('map').on('measure:created', this.markerMeasured, this);
  },

  disable() {
    this._super(...arguments);
    var map = this.get('map');
    map.dragging.disable();
    this.markerClose();
    map.editTools.stopDrawing();
  },

});
