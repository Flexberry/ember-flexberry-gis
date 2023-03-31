import Ember from 'ember';
import * as buffer from 'npm:@turf/buffer';

export default Ember.Mixin.create({
  // не будем удалять слой после завершения рисования
  hideOnDrawingEnd: false,
  hidePreviousOnDrawingStart: true,
  clearOnDisable: false,
  cursor: 'crosshair',
  suffix: '-geom',

  _redrawLayer() {
    Ember.run.debounce(this, () => {
      let polygonLayer = this.get('polygonLayer');
      let container = this.get('_container');
      if (!Ember.isNone(polygonLayer) && container.hasLayer(polygonLayer)) {
        this._renderLayer({ polygonLayer });
      }
    }, 500);
  },

  bufferObserver: Ember.observer('bufferActive', 'bufferRadius', 'bufferUnits', function () {
    Ember.run.once(this, '_redrawLayer');
  }),

  _renderLayer({ layer }) {
    let container = this.get('_container');

    let polygonLayer = this.get('polygonLayer');
    let bufferedMainPolygonLayer = this.get('bufferedMainPolygonLayer');

    this._clearPolygonLayer();

    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');
    let bufferUnits = this.get('bufferUnits');

    if (isBufferActive && bufferRadius > 0) {
      bufferedMainPolygonLayer = bufferedMainPolygonLayer || polygonLayer;
      let buf = buffer.default((bufferedMainPolygonLayer).toGeoJSON(), bufferRadius, { units: bufferUnits });
      polygonLayer = L.geoJSON(buf).getLayers()[0];

      bufferedMainPolygonLayer.addTo(container);
    } else {
      polygonLayer = bufferedMainPolygonLayer || polygonLayer;
      bufferedMainPolygonLayer = null;
    }

    polygonLayer.addTo(container);

    this.set('polygonLayer', polygonLayer);
    this.set('bufferedMainPolygonLayer', bufferedMainPolygonLayer);

    let leafletMap = this.get('leafletMap');
    leafletMap.fire('flexberry-map:geomChanged', { wkt: polygonLayer.toEWKT(L.CRS.EPSG4326) });
  }
});
