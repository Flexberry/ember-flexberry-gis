/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Base geoprovider.

  @class BaseGeoProvider
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
*/
export default Ember.Object.extend({

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

    if (!(requestResult instanceof Ember.RSVP.Promise)) {
      requestResult = new Ember.RSVP.Promise((resolve, reject) => {
        resolve(requestResult);
      });
    }

    return requestResult.then((response) => {
      return this._parseRequestResult(response);
    });
  }
});
