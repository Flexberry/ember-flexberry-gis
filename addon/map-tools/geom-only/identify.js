import BaseIdentify from '../identify';

export default BaseIdentify.extend({
  /**
    Handles map's 'editable:drawing:end' event.

    @method _drawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#polygon">L.Polygon</a>} e.layer Drawn polygon layer.
    @private
  */
  _drawingDidEnd({ layer }) {
    let workingPolygon;
    let bufferedMainPolygon;
    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');
    let leafletMap = this.get('leafletMap');

    if (isBufferActive && bufferRadius > 0) {
      let buffer = this._drawBuffer(layer.toGeoJSON());
      workingPolygon = buffer.getLayers()[0];
      bufferedMainPolygon = layer;
    } else {
      workingPolygon = layer;
    }

    let latlng;
    let boundingBox;
    let workingPolygonType = workingPolygon.toGeoJSON().geometry.type;

    if (workingPolygonType !== 'Point') {
      latlng = workingPolygon.getCenter();
      boundingBox = workingPolygon.getBounds();
      if (boundingBox.getSouthWest().equals(boundingBox.getNorthEast())) {
        // Identification area is point.
        // Identification can be incorrect or even failed in such situation,
        // so extend identification area a little (around specified point).
        let y = leafletMap.getSize().y / 2;
        let a = leafletMap.containerPointToLatLng([0, y]);
        let b = leafletMap.containerPointToLatLng([100, y]);

        // Current scale (related to current zoom level).
        let maxMeters = leafletMap.distance(a, b);

        // Bounding box around specified point with radius of current scale * 0.05.
        boundingBox = boundingBox.getSouthWest().toBounds(maxMeters * 0.05);
        workingPolygon.setLatLngs([boundingBox.getNorthWest(), boundingBox.getNorthEast(), boundingBox.getSouthEast(), boundingBox.getSouthWest()]);
      }
    } else {
      latlng = workingPolygon._latLngs;
    }

    let currentPolygonLayer = this.get('polygonLayer');

    // Remove previously drawn rectangle
    if (currentPolygonLayer) {
      currentPolygonLayer.removeFrom(leafletMap);
    }

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
