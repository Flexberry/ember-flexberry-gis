/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';

/**
  Base geocoder layer component for leaflet map.

  @class GeocoderBaseLayerComponent
  @extend BaseLayerComponent
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
    @returns {<a href="http://leafletjs.com/reference-1.0.0.html#layer">L.Layer</a>} Created leaflet-layer.
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
    @returns {String|Object} Received geocoding results.
  */
  executeGeocoding() {
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
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify(e) {
    let reverseGeocodingResults = this.executeReverseGeocoding({
      boundingBox: Ember.get(e, 'boundingBox')
    });

    if (!(reverseGeocodingResults instanceof Ember.RSVP.Promise)) {
      reverseGeocodingResults = new Ember.RSVP.Promise((resolve, reject) => {
        resolve(reverseGeocodingResults);
      });
    }

    let featuresPromise = reverseGeocodingResults.then((results) => {
      let features = this.parseReverseGeocodingResults(results);
      return Ember.isArray(features) ? features : Ember.A();
    });

    e.results.push({
      layer: this.get('layer'),
      features: featuresPromise
    });
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of search area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which must be searched.
    @param {Object[]} results Objects describing search results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to search result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    let geocodingResults = this.executeGeocoding();

    if (!(geocodingResults instanceof Ember.RSVP.Promise)) {
      geocodingResults = new Ember.RSVP.Promise((resolve, reject) => {
        resolve(geocodingResults);
      });
    }

    let featuresPromise = geocodingResults.then((results) => {
      let features = this.parseGeocodingResults(results);
      return Ember.isArray(features) ? features : Ember.A();
    });

    e.results.push({
      layer: this.get('layer'),
      features: featuresPromise
    });
  }
});
