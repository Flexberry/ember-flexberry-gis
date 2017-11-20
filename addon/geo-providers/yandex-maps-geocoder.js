/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseGeoProvider from './base';

/**
  Yandex maps geoprovider.

  @class YandexMapsGeoCoder
  @extends BaseGeoProvider
*/
export default BaseGeoProvider.extend({
  /**
    Url for sending requests.

    @property url
    @type {String}
  */
  url: 'https://geocode-maps.yandex.ru/1.x/',

  /**
    Makes a request.

    @param {Object} options Query options.
  */
  _executeRequest(options) {
    let geocode = options.query;
    let format = 'json';

    let baseUrl = this.get('url');
    let requestUrl = `${baseUrl}?geocode=${geocode}&` +
      `format=${format}`;

    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.run(() => {
        Ember.$.ajax(requestUrl, { dataType: 'json' }).done((data, textStatus, jqXHR) => {
          resolve(data);
        }).fail((jqXHR, textStatus, errorThrown) => {
          reject(errorThrown);
        });
      });
    });
  },

  /**
    Parses response data.

    @param {String} response Response result.
  */
  _parseRequestResult({ response }) {
    let result = [];
    let geoObjectCollection = Ember.get(response, 'GeoObjectCollection');
    if (!Ember.isNone(geoObjectCollection)) {

      if (Ember.isArray(geoObjectCollection.featureMember) && !Ember.isBlank(geoObjectCollection.featureMember)) {
        let geoObject = Ember.get(geoObjectCollection, 'featureMember.0.GeoObject');
        result.push({ name: `${geoObject.description}, ${geoObject.name}`, type: 'marker', coordinates: Ember.get(geoObject, 'Point.pos') });
      }
    }

    return result;
  },
});
