/**
  @module ember-flexberry-gis
*/

/**
  Registers options for leaflet library.

  @for ApplicationInitializer
  @method leaflet.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  // Set up leaflet images path (see index.js file where leaflet is imported into application's vendor.js).
  L.Icon.Default.imagePath = '/assets/images/';
}

export default {
  name: 'leaflet',
  initialize
};
