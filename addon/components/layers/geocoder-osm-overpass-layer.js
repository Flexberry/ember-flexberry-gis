/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import { run } from '@ember/runloop';
import { Promise } from 'rsvp';
import { get } from '@ember/object';
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
  parseGeocodingResults() {
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
    const featuresCollection = window.osmtogeojson(results, { flatProperties: true, });
    return get(featuresCollection, 'features');
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
    const boundingBox = get(options, 'boundingBox');
    const sw = boundingBox.getSouthWest();
    const ne = boundingBox.getNorthEast();

    const overpassBaseUrl = this.get('url');
    const overpassBoundingBox = `${[sw.lat, sw.lng, ne.lat, ne.lng].join(',')}`;
    const overpassNode = `node(${overpassBoundingBox})`;

    // Url to get all nodes within specified bounding box.
    const overpassRequestUrl = `${overpassBaseUrl}?data=[out:json];(${overpassNode};<;);out;`;

    return new Promise((resolve, reject) => {
      run(() => {
        $.ajax(overpassRequestUrl).done((data) => {
          resolve(data);
        }).fail((jqXHR, textStatus, errorThrown) => {
          reject(errorThrown);
        });
      });
    });
  },
});
