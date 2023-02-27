import { latlngToPointEWKT, latlngToPolylineEWKT, latlngToPolygonEWKT, featureGroupToMultiPointEWKT } from '../utils/layer-to-ewkt';

export function initialize(application) {
  // Add custom leaflet functions
  let PointToEWKT = {
    toEWKT: function (crs, precision) {
      return latlngToPointEWKT(this.getLatLng(), crs, precision);
    }
  };

  L.Marker.include(PointToEWKT);
  L.Circle.include(PointToEWKT);
  L.CircleMarker.include(PointToEWKT);

  L.Polyline.include({
    toEWKT: function (crs, precision) {
      return latlngToPolylineEWKT(this._latlngs, crs, precision);
    }
  });

  L.Polygon.include({
    toEWKT: function (crs, precision) {
      return latlngToPolygonEWKT(this._latlngs, crs, precision);
    }
  });

  L.FeatureGroup.include({
    toEWKT: function (crs, precision) {
      return featureGroupToMultiPointEWKT(this.getLayers(), crs, precision);
    }
  });
}

export default {
  name: 'leaflet-ewkt',
  initialize
};
