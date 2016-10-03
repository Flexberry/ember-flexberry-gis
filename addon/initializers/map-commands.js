/**
  @module ember-flexberry-gis
*/

/**
  Registers options for custom 'map-command' type.

  @for ApplicationInitializer
  @method mapCommands.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  application.registerOptionsForType('map-command', { singleton: false });
}

export default {
  name: 'map-commands',
  initialize
};
