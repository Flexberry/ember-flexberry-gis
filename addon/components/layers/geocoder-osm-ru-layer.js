/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import $ from 'jquery';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { get } from '@ember/object';
import GeocoderBaseLayer from './geocoder-base-layer';

/**
  Geocoder layer component for leaflet map.
  uses API of [OpenStreetMap.ru/api/search](https://github.com/ErshKUS/OpenStreetMap.ru/blob/master/api/search).

  @class GeocoderOsmRuLayerComponent
  @extends GeocoderBaseLayer
*/
export default GeocoderBaseLayer.extend({
  /**
    OSM.ru service base url.

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
    const matches = get(results || { matches: [], }, 'matches');

    const features = A(matches).map((match) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',

        // AS GeoJSON specification declares, point coordinates are in x, y order
        // (easting, northing for projected coordinates, longitude, latitude for geographic coordinates).
        coordinates: [get(match, 'lon'), get(match, 'lat')],
      },
      properties: match,
    }));

    return features;
  },

  /**
    Parses received reverse geocoding results into array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @method parseReverseGeocodingResults
    @param {String|Object} results Received reverse geocoding results.
    @returns {Object[]} Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
  */
  parseReverseGeocodingResults(results) {
    // OSM.ru layer doesn't implement reverse geocoding.
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
    options = options || {};
    const queryString = get(options, 'searchOptions.queryString');
    const searchType = get(options, 'searchOptions.searchType') || 'all';
    const maxResultsCount = get(options, 'searchOptions.maxResultsCount');
    const latlng = get(options, 'latlng');

    const osmRuBaseUrl = this.get('url');
    const requestUrl = `${osmRuBaseUrl}?q=${queryString}&`
      + `st=${searchType}&`
      + `cnt=${maxResultsCount}&`
      + `lat=${latlng.lat}&lon=${latlng.lng}`;

    return new Promise((resolve, reject) => {
      run(() => {
        $.ajax(requestUrl, { dataType: 'text', }).done((data, textStatus, jqXHR) => {
          // For some reason jQuery fails when parsing OSM.ru response text into JSON,
          // even when request where successful.
          // So we use dataType 'text' & parse response manually.
          let results = {};
          try {
            results = JSON.parse(jqXHR.responseText);
          } catch (parseError) {
            reject(parseError);
          }

          if (!isBlank(results.error)) {
            reject(results.error);
          }

          resolve(results);
        }).fail((jqXHR, textStatus, errorThrown) => {
          reject(errorThrown);
        });
      });
    });
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
    // OSM.ru layer doesn't implement reverse geocoding.
  },
});
