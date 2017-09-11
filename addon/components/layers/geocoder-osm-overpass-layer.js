/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import GeocoderBaseLayer from './geocoder-base-layer';

/**
  Geocoder layer component for leaflet map.
  Uses [Overpass API](http://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide) to perform straight & reverse geocoding).

  @class GeocoderOsmOverpassLayerComponent
  @extends GeocoderBaseLayer
*/
export default GeocoderBaseLayer.extend({
  /**
    Overpass API service base url.

    @property url
    @type String
    @default null
  */
  url: null,

  /**
    Parses received geocoding results into array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @method parseGeocodingResults
    @param {String|Object} results Received geocoding results.
    @returns {Object[]} Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
  */
  parseGeocodingResults(results) {
    // Overpass layer doesn't implement straight geocoding.
  },

  /**
    Parses received reverse geocoding results into array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @method parseReverseGeocodingResults
    @param {String|Object} results Received reverse geocoding results.
    @returns {Object[]} Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
  */
  parseReverseGeocodingResults(results) {
    let featuresCollection = window.osmtogeojson(results, { flatProperties: true });
    return Ember.get(featuresCollection, 'features');
  },

  /**
    Executes geocoding with options related to layer's current properties.

    @method executeGeocoding
    @param {Object} options Geocoding options.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} options.latlng Center of the search area.
    @param {Object} options.searchOptions Search options related to layer type.
    @returns {String|Object} Received geocoding results.
  */
  executeGeocoding() {
    // Overpass layer doesn't implement straight geocoding.
  },

  /**
    Executes reverse geocoding with options related to layer's current properties.

    @method executeReverseGeocoding
    @param {Object} options Method options.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox
    Bounds of reverse geocoding area.
    @returns {String|Object} Received reverse geocoding results.
  */
  executeReverseGeocoding(options) {
    options = options || {};
    let boundingBox = Ember.get(options, 'boundingBox');
    let sw = boundingBox.getSouthWest();
    let ne = boundingBox.getNorthEast();

    let overpassBaseUrl = this.get('url');
    let overpassBoundingBox = `${[sw.lat, sw.lng, ne.lat, ne.lng].join(',')}`;
    let overpassNode = `node(${overpassBoundingBox})`;

    // Url to get all nodes within specified bounding box.
    let overpassRequestUrl = `${overpassBaseUrl}?data=[out:json];(${overpassNode};<;);out;`;

    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.run(() => {
        Ember.$.ajax(overpassRequestUrl).done((data, textStatus, jqXHR) => {
          resolve(data);
        }).fail((jqXHR, textStatus, errorThrown) => {
          reject(errorThrown);
        });
      });
    });
  }
});
