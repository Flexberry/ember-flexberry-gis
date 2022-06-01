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
  L.Icon.Default.imagePath = `${baseURL || '/'}assets/images/`;

  // Add custom leaflet functions
  const PointToGeoJSON = {
    toProjectedGeoJSON(crs, precision) {
      return L.GeoJSON.getFeature(this, {
        type: 'Point',
        coordinates: latLngToCoords(this.getLatLng(), crs, precision),
      });
    },
  };

  L.Marker.include(PointToGeoJSON);
  L.Circle.include(PointToGeoJSON);
  L.CircleMarker.include(PointToGeoJSON);

  L.Polyline.include({
    toProjectedGeoJSON(crs, precision) {
      const multi = !L.LineUtil.isFlat(this._latlngs);

      const coords = latLngsToCoords(this._latlngs, crs, multi ? 1 : 0, false, precision);

      return L.GeoJSON.getFeature(this, {
        type: `${multi ? 'Multi' : ''}LineString`,
        coordinates: coords,
      });
    },
  });

  L.Polygon.include({
    toProjectedGeoJSON(crs, precision) {
      const holes = !L.LineUtil.isFlat(this._latlngs);
      let multi = holes && !L.LineUtil.isFlat(this._latlngs[0]);
      if (multi) {
        multi = 2;
      } else if (holes) {
        multi = 1;
      } else {
        multi = 0;
      }

      let coords = latLngsToCoords(this._latlngs, crs, multi, true, precision);

      if (!holes) {
        coords = [coords];
      }

      return L.GeoJSON.getFeature(this, {
        type: `${multi ? 'Multi' : ''}Polygon`,
        coordinates: coords,
      });
    },
  });

  L.LayerGroup.include({
    toProjectedMultiPoint(crs, precision) {
      const coords = [];

      this.eachLayer(function (layer) {
        coords.push(layer.toProjectedGeoJSON(crs, precision).geometry.coordinates);
      });

      return L.GeoJSON.getFeature(this, {
        type: 'MultiPoint',
        coordinates: coords,
      });
    },

    toProjectedGeoJSON(crs, precision) {
      const type = this.feature && this.feature.geometry && this.feature.geometry.type;

      if (type === 'MultiPoint') {
        return this.toProjectedMultiPoint(crs, precision);
      }

      const isGeometryCollection = type === 'GeometryCollection';
      const jsons = [];

      this.eachLayer(function (layer) {
        if (layer.toProjectedGeoJSON) {
          const json = layer.toProjectedGeoJSON(crs, precision);
          if (isGeometryCollection) {
            jsons.push(json.geometry);
          } else {
            const feature = L.GeoJSON.asFeature(json);

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
          type: 'GeometryCollection',
        });
      }

      return {
        type: 'FeatureCollection',
        features: jsons,
      };
    },
  });
}

export default {
  name: 'leaflet',
  initialize,
};
