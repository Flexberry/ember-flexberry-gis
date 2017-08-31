/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';

/**
  Base geocoder layer component for leaflet map.

  @class GeocoderBaseLayerComponent
  @extends BaseLayerComponent
*/
export default BaseLayer.extend({
  /**
    Geocoding service base url.

    @property url
    @type String
    @default null
  */
  url: null,

  /**
    Sets z-index for layer.

    @method setZIndex
  */
  setZIndex() {
    // Should not call setZIndex for layer, such as L.LayerGroup.
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    // Leaflet-layer is actually unnecessary for geocoder-layer,
    // but base layer's logic needs some leaflet-layer to be created,
    // so create empty layer-group.
    return L.layerGroup();
  },

  /**
    Parses received geocoding results into array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @method parseGeocodingResults
    @param {String|Object} results Received geocoding results.
    @returns {Object[]} Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
  */
  parseGeocodingResults(results) {
    Ember.assert('GeocoderBaseLayer\'s \'parseGeocodingResults\' method should be overridden.');
  },

  /**
    Parses received reverse geocoding results into array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @method parseReverseGeocodingResults
    @param {String|Object} results Received reverse geocoding results.
    @returns {Object[]} Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
  */
  parseReverseGeocodingResults(results) {
    Ember.assert('GeocoderBaseLayer\'s \'parseReverseGeocodingResults\' method should be overridden.');
  },

  /**
    Executes geocoding with options related to layer's current properties.

    @method executeGeocoding
    @param {Object} options Geocoding options.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} options.latlng Center of the search area.
    @param {Object} options.searchOptions Search options related to layer type.
    @returns {String|Object} Received geocoding results.
  */
  executeGeocoding(options) {
    Ember.assert('GeocoderBaseLayer\'s \'executeGeocoding\' method should be overridden.');
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
    Ember.assert('GeocoderBaseLayer\'s \'executeReverseGeocoding\' method should be overridden.');
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.

    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} e.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} polygonLayer Polygon layer related to given area.
    @param {Object[]} e.layers Objects describing those layers which must be identified.
    @param {Object[]} e.results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify(e) {
    let boundingBox = Ember.get(e, 'polygonLayer').getBounds();

    let reverseGeocodingResults = this.executeReverseGeocoding({
      boundingBox: boundingBox
    });

    if (!(reverseGeocodingResults instanceof Ember.RSVP.Promise)) {
      reverseGeocodingResults = new Ember.RSVP.Promise((resolve, reject) => {
        resolve(reverseGeocodingResults);
      });
    }

    let featuresPromise = reverseGeocodingResults.then((results) => {
      let features = this.parseReverseGeocodingResults(results);
      if (!Ember.isArray(features)) {
        features = Ember.A();
      }

      this.injectLeafletLayersIntoGeoJSON(features);

      return features;
    });

    return featuresPromise;
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
    @param {Object[]} layer Object describing layer that must be searched.
    @param {Object} searchOptions Search options related to layer type.
    @param {Object} results Hash containing search results.
    @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    let geocodingResults = this.executeGeocoding(e);

    if (!(geocodingResults instanceof Ember.RSVP.Promise)) {
      geocodingResults = new Ember.RSVP.Promise((resolve, reject) => {
        resolve(geocodingResults);
      });
    }

    let featuresPromise = geocodingResults.then((results) => {
      let features = this.parseGeocodingResults(results);
      if (!Ember.isArray(features)) {
        features = Ember.A();
      }

      this.injectLeafletLayersIntoGeoJSON(features);

      return features;
    });

    return featuresPromise;
  }
});
