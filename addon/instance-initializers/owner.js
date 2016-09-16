/**
  @module ember-flexberry
*/

import Ember from 'ember';

/**
  Adds some additional methods into [ember application instance]("http://emberjs.com/api/classes/Ember.ApplicationInstance.html).

  @for ApplicationInstanceInitializer
  @method owner.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  // Known classes cache.
  let known = {};

  /**
    Returns object containing factories of known classes for the specified type,
    or a single factory if the class name is specified too.

    @for ApplicationInstance
    @method knownForType
    @param {String} type Type for which factories must be returned.
    @param {String} [className] Class name for which a single factory mast be returned.
    @returns {Object} Object containing factories of known classes for the specified type,
    or a single factory if the class name is specified too.
  */
  let knownForType = applicationInstance.knownForType = function(type, className) {
    if (!Ember.isNone(className)) {
      Ember.assert(
        `Wrong value of \`className\` parameter: \`${className}\`. ` +
        `Allowed values for type \`${type}\` are: [\`${knownNamesForType(type).join(`\`, \``)}\`].`,
        isKnownNameForType(type, className));

      return knownForType(type)[className];
    }

    let knownClasses = known[type];
    if (Ember.isNone(knownClasses)) {
      knownClasses = {};

      let resolver = applicationInstance.application.__registry__.resolver;
      Ember.A(Object.keys(resolver.knownForType(type))).forEach((knownClass) => {
        let className = knownClass.split(':')[1];
        let classFactory = applicationInstance._lookupFactory(knownClass);

        knownClasses[className] = classFactory;
      });

      known[type] = knownClasses;
    }

    return knownClasses;
  };

  /**
    Returns array containing names of known classes for the specified type.

    @for ApplicationInstance
    @method knownNamesForType
    @param {String} type Type for which known names must be returned.
    @returns {String[]} Array containing names of known classes for the specified type.
  */
  let knownNamesForType = applicationInstance.knownNamesForType = function(type) {
    return Ember.A(Object.keys(knownForType(type)));
  };

  /**
    Checks if class with given name is known for the specified type.

    @for ApplicationInstance
    @method isKnownNameForType
    @param {String} type Type in which class existence must be checked.
    @param {String} [className] Class name.
    @returns {String[]} Flag indicating whether class with given name is known for the specified type or not.
  */
  let isKnownNameForType = applicationInstance.isKnownNameForType = function(type, className) {
    return knownNamesForType(type).contains(className);
  };
}

export default {
  name: 'owner',
  initialize
};
