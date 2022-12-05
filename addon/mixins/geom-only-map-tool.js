import Ember from 'ember';

export default Ember.Mixin.create({
  _baseDrawingDidEnd(workingPolygon) {
    let leafletMap = this.get('leafletMap');
    let polygonLayer = L.geoJSON().addTo(leafletMap);
    polygonLayer.addData(workingPolygon.toGeoJSON());

    this.set('polygonLayer', polygonLayer);

    leafletMap.fire('flexberry-map:geomChanged', { wkt: workingPolygon.toEWKT(L.CRS.EPSG4326) });
  },

  _clearPolygonLayer() {
    // Remove already drawn figure.
    let polygonLayer = this.get('polygonLayer');
    if (polygonLayer) {
      polygonLayer.remove();
    }

    let bufferedMainPolygon = this.get('bufferedMainPolygonLayer');
    if (bufferedMainPolygon) {
      bufferedMainPolygon.remove();
    }

  }
});
