import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({
  _layer: null,
  _measure: null,
  multitool: true,

  measureClose() {
    this._layer.disableEdit();
    this.get('map').off('measure:created');
    this._layer.remove();
  },

  measured(e) {
    this._layer = e.layer;
    this.get('map').off('measure:created');
  },

  enable() {
    this._super(...arguments);
    // there are problems if dragging is disabled
    var map = this.get('map');
    map.dragging.enable();
    this._measure = map.measureTools ? map.measureTools : L.measureBase(map);
    map.on('measure:created', this.measured, this);
  },

  disable() {
    this._super(...arguments);
    var map = this.get('map');
    map.dragging.disable();
    map.editTools.stopDrawing();
    this.measureClose();
    this._layer = null;
    this._measure = null;
  },

});
