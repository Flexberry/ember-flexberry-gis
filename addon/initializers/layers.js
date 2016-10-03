/**
  @module ember-flexberry-gis
*/

/**
  Registers options for custom 'layer' type.

  @for ApplicationInitializer
  @method layers.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  application.registerOptionsForType('layer', { instantiate: false });
}

export default {
  name: 'layers',
  initialize
};
