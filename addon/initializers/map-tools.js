/**
  @module ember-flexberry-gis
*/

/**
  Registers options for custom 'map-tool' type.

  @for ApplicationInitializer
  @method mapTools.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  application.registerOptionsForType('map-tool', { singleton: false });
}

export default {
  name: 'map-tools',
  initialize
};
