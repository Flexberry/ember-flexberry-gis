/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';

import { get } from '@ember/object';
import $ from 'jquery';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';
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
    const geocode = options.query;
    const format = 'json';
    const { top, } = options;
    const { skip, } = options;

    const baseUrl = this.get('url');
    const requestUrl = `${baseUrl}?geocode=${geocode}&`
      + `format=${format}&`
      + `results=${top}&`
      + `skip=${skip}`;

    return new Promise((resolve, reject) => {
      run(() => {
        $.ajax(requestUrl, { dataType: 'json', }).done((data) => {
          resolve(data);
        }).fail((errorThrown) => {
          reject(errorThrown);
        });
      });
    });
  },

  /**
    Parses response data.

    @param {Object} response Response result.
  */
  _parseRequestResult({ response, }) {
    let result = null;
    const geoObjectCollection = get(response, 'GeoObjectCollection');
    if (!isNone(geoObjectCollection)) {
      const total = get(geoObjectCollection, 'metaDataProperty.GeocoderResponseMetaData.found');
      if (!isNone(total) && total !== '0') {
        result = { total, data: [], };

        const objects = get(geoObjectCollection, 'featureMember');
        objects.forEach((element) => {
          const description = get(element, 'GeoObject.description');
          const name = get(element, 'GeoObject.name');
          const position = get(element, 'GeoObject.Point.pos');

          result.data.push({ name: `${description}, ${name}`, type: 'marker', position, });
        });
      }
    }

    return result;
  },
});
