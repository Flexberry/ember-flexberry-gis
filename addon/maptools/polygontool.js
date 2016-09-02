import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({

  _layer: null,
  _measure: null,

  polygonClose(e) {
    this.polygonLayer.disableEdit();
    this.get('map').off('measure:created');
    this.polygonLayer.remove();
  },

  polygonMeasured(e) {
    this.polygonLayer = e.layer;
    //     e.layer.disableEdit();
    this.get('map').off('measure:created');
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
    this._measure = L.measureBase(map);
    this._measure.polygonBaseTool.startMeasure();
    this.get('map').on('measure:created', this.polygonMeasured, this);
  },

  disable() {
    this._super(...arguments);
    var map = this.get('map');
    map.dragging.disable();
    this.polygonClose();
    map.editTools.stopDrawing();
  },
});
