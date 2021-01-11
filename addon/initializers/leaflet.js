/**
  @module ember-flexberry-gis
*/

import { latLngToCoords, latLngsToCoords } from '../utils/lat-lng-to-coord';

/**
  Registers options for leaflet library.

  @for ApplicationInitializer
  @method leaflet.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
  @param {String} Application's base URL from config/environment.js.
*/
export function initialize(application, baseURL) {
  // Set up leaflet images path (see index.js file where leaflet is imported into application's vendor.js).
  L.Icon.Default.imagePath = (baseURL || '/') + 'assets/images/';

  // Add custom leaflet functions
  let PointToGeoJSON = {
    toProjectedGeoJSON: function (crs, precision) {
      return L.GeoJSON.getFeature(this, {
        type: 'Point',
        coordinates: latLngToCoords(this.getLatLng(), crs, precision)
      });
    }
  };

  L.Marker.include(PointToGeoJSON);
  L.Circle.include(PointToGeoJSON);
  L.CircleMarker.include(PointToGeoJSON);

  L.Polyline.include({
    toProjectedGeoJSON: function (crs, precision) {
      var multi = !L.LineUtil.isFlat(this._latlngs);

      var coords = latLngsToCoords(this._latlngs, crs, multi ? 1 : 0, false, precision);

      return L.GeoJSON.getFeature(this, {
        type: (multi ? 'Multi' : '') + 'LineString',
        coordinates: coords
      });
    }
  });

  L.Polygon.include({
    toProjectedGeoJSON: function (crs, precision) {
      var holes = !L.LineUtil.isFlat(this._latlngs);
      var multi = holes && !L.LineUtil.isFlat(this._latlngs[0]);
      var coords = latLngsToCoords(this._latlngs, crs, multi ? 2 : holes ? 1 : 0, true, precision);

      if (!holes) {
        coords = [coords];
      }

      return L.GeoJSON.getFeature(this, {
        type: (multi ? 'Multi' : '') + 'Polygon',
        coordinates: coords
      });
    }
  });

  L.LayerGroup.include({
    toProjectedMultiPoint: function (crs, precision) {
      var coords = [];

      this.eachLayer(function (layer) {
        coords.push(layer.toProjectedGeoJSON(crs, precision).geometry.coordinates);
      });

      return L.GeoJSON.getFeature(this, {
        type: 'MultiPoint',
        coordinates: coords
      });
    },

    toProjectedGeoJSON: function (crs, precision) {

      var type = this.feature && this.feature.geometry && this.feature.geometry.type;

      if (type === 'MultiPoint') {
        return this.toProjectedMultiPoint(crs, precision);
      }

      var isGeometryCollection = type === 'GeometryCollection';
      var jsons = [];

      this.eachLayer(function (layer) {
        if (layer.toProjectedGeoJSON) {
          var json = layer.toProjectedGeoJSON(crs, precision);
          if (isGeometryCollection) {
            jsons.push(json.geometry);
          } else {
            var feature = L.GeoJSON.asFeature(json);

            // Squash nested feature collections
            if (feature.type === 'FeatureCollection') {
              jsons.push.apply(jsons, feature.features);
            } else {
              jsons.push(feature);
            }
          }
        }
      });

      if (isGeometryCollection) {
        return L.GeoJSON.getFeature(this, {
          geometries: jsons,
          type: 'GeometryCollection'
        });
      }

      return {
        type: 'FeatureCollection',
        features: jsons
      };
    }
  });

}

export default {
  name: 'leaflet',
  initialize
};
