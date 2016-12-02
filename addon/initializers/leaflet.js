/**
  @module ember-flexberry-gis
*/

/**
  Registers options for leaflet library.

  @for ApplicationInitializer
  @method leaflet.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
  @param {String} Application's base URL from config/environment.js.
*/
export function initialize(application, baseURL) {
  // Set up leaflet images path (see index.js file where leaflet is imported into application's vendor.js).
  L.Icon.Default.imagePath = (baseURL || '/') + 'assets/images/';
}

export default {
  name: 'leaflet',
  initialize
};
