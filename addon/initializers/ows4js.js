/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Overrides some methods in ows4js library.

  @for ApplicationInitializer
  @method ows4js.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  // Override badly implemented GET & POST methods.
  window.Ows4js.Util.httpGet = function(url) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax(url).done((data, textStatus, jqXHR) => {
        if (jqXHR.responseText.indexOf('ows:ExceptionReport') > 0) {
          reject(jqXHR.responseText);
        } else {
          resolve(jqXHR);
        }
      }).fail((jqXHR, textStatus, errorThrown) => {
        reject(errorThrown || 'Unknown error');
      });
    });
  };

  window.Ows4js.Util.httpPost = function(url, lang, request, credentials) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let settings = {
        method: 'POST',
        url: url,
        dataType: 'xml',
        contentType: 'application/xml',
        data: request,
        processData: false
      };

      if (!Ember.isBlank(lang)) {
        settings.headers = {
          'Accept-Language': lang
        };
      }

      if (credentials !== undefined && credentials.user !== undefined && credentials.pass !== undefined) {
        if (!settings.headers) {
          settings.headers = {};
        }

        settings.headers.Authorization = 'Basic ' + btoa(credentials.user + ':' + credentials.pass);
      }

      Ember.$.ajax(settings).done((data, textStatus, jqXHR) => {
        if (jqXHR.responseText.indexOf('ows:ExceptionReport') > 0) {
          reject(jqXHR.responseText);
        } else {
          resolve(jqXHR.responseXML);
        }
      }).fail((jqXHR, textStatus, errorThrown) => {
        reject(errorThrown || 'Unknown error');
      });
    });
  };
}

export default {
  name: 'ows4js',
  initialize
};
