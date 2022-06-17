/**
  @module ember-flexberry
*/

import {
  latlngToPointJsts,
  latlngToPolylineJsts,
  latlngToPolygonJsts
} from '../utils/layer-to-jsts';

export function initialize() {
  // Add custom leaflet functions
  const PointToJsts = {
    toJsts(crs, scale, precision) {
      return latlngToPointJsts(this.getLatLng(), crs, precision, scale);
    },
  };

  L.Marker.include(PointToJsts);
  L.Circle.include(PointToJsts);
  L.CircleMarker.include(PointToJsts);

  L.Polyline.include({
    toJsts(crs, scale, precision) {
      return latlngToPolylineJsts(this._latlngs, crs, precision, scale);
    },
  });

  L.Polygon.include({
    toJsts(crs, scale, precision) {
      return latlngToPolygonJsts(this._latlngs, crs, precision, scale);
    },
  });
}

export default {
  name: 'leaflet-jsts',
  initialize,
};
