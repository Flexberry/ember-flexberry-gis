/**
  @module ember-flexberry-gis
*/

import { Promise } from 'rsvp';

import EmberObject from '@ember/object';

/**
  Base geoprovider.

  @class BaseGeoProvider
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
*/
export default EmberObject.extend({

  /**
    Makes a request.

    @param {Object} options Query options.
  */
  _executeRequest(options) {
  },

  /**
    Parses response data.

    @param {String} response Response result.
  */
  _parseRequestResult(response) {
  },

  /**
    Makes a request to the provider and parses the answer.

    @param {Object} options Options object for geocode operation.
    @param {String} options.query Search query for geocode.
    @returns <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a> Promise returning response data.
  */
  executeGeocoding(options) {
    let requestResult = this._executeRequest(options);

    if (!(requestResult instanceof Promise)) {
      requestResult = new Promise((resolve, reject) => {
        resolve(requestResult);
      });
    }

    return requestResult.then((response) => this._parseRequestResult(response));
  },
});
