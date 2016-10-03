/**
  @module ember-flexberry-gis
*/

/**
  Registers options for custom 'coordinate-reference-system' type.

  @for ApplicationInitializer
  @method coordinateReferenceSystems.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  application.registerOptionsForType('coordinate-reference-system', { instantiate: false });
}

export default {
  name: 'coordinate-reference-systems',
  initialize
};
