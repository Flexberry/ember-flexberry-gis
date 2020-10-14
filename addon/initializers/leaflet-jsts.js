/**
  @module ember-flexberry
*/

import { latlngToPointJsts, latlngToPolylineJsts, latlngToPolygonJsts } from '../utils/layer-to-jsts';

export function initialize(application) {
  // Add custom leaflet functions
  let PointToJsts = {
    toJsts: function (crs, precision) {
      return latlngToPointJsts(this.getLatLng(), crs, precision);
    }
  };

  L.Marker.include(PointToJsts);
  L.Circle.include(PointToJsts);
  L.CircleMarker.include(PointToJsts);

  L.Polyline.include({
    toJsts: function (crs, precision) {
      return latlngToPolylineJsts(this._latlngs, crs, precision);
    }
  });

  L.Polygon.include({
    toJsts: function (crs, precision) {
      return latlngToPolygonJsts(this._latlngs, crs, precision);
    }
  });
}

export default {
  name: 'leaflet-jsts',
  initialize
};
