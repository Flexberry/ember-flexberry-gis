/**
  @module ember-flexberry-gis
*/

/**
  Inject local-storage-service instance into components.

  @for ApplicationInitializer
  @method localStorageService.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  application.inject('component:spatial-bookmark', 'local-storage-service', 'service:local-storage');
}

export default {
  name: 'local-storage',
  initialize
};
