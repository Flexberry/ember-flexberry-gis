/**
  @module ember-flexberry
*/

import { A } from '@ember/array';

import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';

/**
  Adds some additional methods into [ember application instance]("http://emberjs.com/api/classes/Ember.ApplicationInstance.html).

  @for ApplicationInstanceInitializer
  @method owner.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  // Known classes cache.
  const known = {};

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
  const knownForType = applicationInstance.knownForType = function (type, className) {
    if (!isNone(className)) {
      assert(
        `Wrong value of \`className\` parameter: \`${className}\`. `
        + `Allowed values for type \`${type}\` are: [\`${knownNamesForType(type).join('`, `')}\`].`,
        isKnownNameForType(type, className)
      );

      return knownForType(type)[className];
    }

    let knownClasses = known[type];
    if (isNone(knownClasses)) {
      knownClasses = {};

      const { resolver, } = applicationInstance.application.__registry__;
      A(Object.keys(resolver.knownForType(type))).forEach((knownClass) => {
        const className = knownClass.split(':')[1];
        const classFactory = applicationInstance._lookupFactory(knownClass);

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
  let knownNamesForType = applicationInstance.knownNamesForType = function (type) {
    return A(Object.keys(knownForType(type)));
  };

  /**
    Checks if class with given name is known for the specified type.

    @for ApplicationInstance
    @method isKnownNameForType
    @param {String} type Type in which class existence must be checked.
    @param {String} [className] Class name.
    @returns {String[]} Flag indicating whether class with given name is known for the specified type or not.
  */
  let isKnownNameForType = applicationInstance.isKnownNameForType = function (type, className) {
    return knownNamesForType(type).contains(className);
  };
}

export default {
  name: 'owner',
  initialize,
};
