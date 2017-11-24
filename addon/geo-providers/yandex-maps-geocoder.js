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
    let top = options.top;
    let skip = options.skip;

    let baseUrl = this.get('url');
    let requestUrl = `${baseUrl}?geocode=${geocode}&` +
      `format=${format}&` +
      `results=${top}&` +
      `skip=${skip}`;

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

    @param {Object} response Response result.
  */
  _parseRequestResult({ response }) {
    let result = null;
    let geoObjectCollection = Ember.get(response, 'GeoObjectCollection');
    if (!Ember.isNone(geoObjectCollection)) {
      let total = Ember.get(geoObjectCollection, 'metaDataProperty.GeocoderResponseMetaData.found');
      if (!Ember.isNone(total) && total !== '0') {
        result = { total, data: [] };

        let objects = Ember.get(geoObjectCollection, 'featureMember');
        objects.forEach(element => {
          let description = Ember.get(element, 'GeoObject.description');
          let name = Ember.get(element, 'GeoObject.name');
          let position = Ember.get(element, 'GeoObject.Point.pos');

          result.data.push({ name: `${description}, ${name}`, type: 'marker', position });
        });
      }
    }

    return result;
  },
});
