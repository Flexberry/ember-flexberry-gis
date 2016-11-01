/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import GeocoderBaseLayer from './geocoder-base-layer';

/**
  Geocoder layer component for leaflet map.
  Uses API of [yandex geocoder](https://tech.yandex.ru/maps/doc/geocoder/desc/concepts/About-docpage/).

  @class GeocoderYandexLayerComponent
  @extend GeocoderBaseLayer
*/
export default GeocoderBaseLayer.extend({
  /**
    Yandex geocoder service base url.

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
    results = results || {};
    let features = Ember.A(Ember.get(results, 'response.GeoObjectCollection.featureMember') || []).map((featureMember) => {
      let geoObject = Ember.get(featureMember, 'GeoObject');
      let geocoderMetadata = Ember.get(geoObject, 'metaDataProperty.GeocoderMetaData');
      let addressDetails = Ember.get(geocoderMetadata, 'AddressDetails');
      let pointCoordinates = (Ember.get(geoObject, 'Point.pos') || '').split(' ');

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pointCoordinates,
        },
        properties: {
          name: Ember.get(geoObject, 'name'),
          description: Ember.get(geoObject, 'description'),
          text: Ember.get(geocoderMetadata, 'text'),
          address: Ember.get(addressDetails, 'Country.AddressLine'),
          country: Ember.get(addressDetails, 'Country.CountryName'),
          administrativeArea: Ember.get(addressDetails, 'Country.AdministrativeArea.AdministrativeAreaName'),
          subAdministrativeArea: Ember.get(addressDetails, 'Country.AdministrativeArea.SubAdministrativeArea.SubAdministrativeAreaName'),
          locality: Ember.get(addressDetails, 'Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName'),
          premise: Ember.get(addressDetails, 'Country.AdministrativeArea.SubAdministrativeArea.Locality.Premise.PremiseName'),
        }
      };
    });

    return Ember.A(features);
  },

  /**
    Parses received reverse geocoding results into array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @method parseReverseGeocodingResults
    @param {String|Object} results Received reverse geocoding results.
    @returns {Object[]} Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
  */
  parseReverseGeocodingResults(results) {
    // TODO: implement reverse geocoding.
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
    let queryString = Ember.get(options, 'searchOptions.queryString');
    let maxResultsCount = Ember.get(options, 'searchOptions.maxResultsCount');
    let skipResultsCount = Ember.get(options, 'searchOptions.skipResultsCount');
    let language = Ember.get(options, 'searchOptions.language');
    let apikey = Ember.get(options, 'searchOptions.apikey');

    let osmRuBaseUrl = this.get('url');
    let requestUrl = `${osmRuBaseUrl}?` +
      `&geocode=${queryString}` +
      `&results=${maxResultsCount}` +
      `&skip=${skipResultsCount}` +
      `&lang=${language}` +
      `&format=json`;
    if (!Ember.isBlank(apikey)) {
      requestUrl = `${requestUrl}&apikey=${apikey}`;
    }

    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.run(() => {
        Ember.$.ajax(requestUrl).done((data, textStatus, jqXHR) => {
          resolve(data);
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
    // TODO: implement reverse geocoding.
  }
});
