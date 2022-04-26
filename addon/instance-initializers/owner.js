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
  const knownForType = function (type, className) {
    const isKnownNameForType = this.isKnownNameForType(type, className);
    const knownNamesForType = this.knownNamesForType(type);
    if (!isNone(className)) {
      assert(
        `Wrong value of \`className\` parameter: \`${className}\`. `
        + `Allowed values for type \`${type}\` are: [\`${knownNamesForType.join('`, `')}\`].`,
        isKnownNameForType
      );

      return knownForType(type)[className];
    }

    let knownClasses = known[type];
    if (isNone(knownClasses)) {
      knownClasses = {};

      const { resolver, } = applicationInstance.application.__registry__;
      A(Object.keys(resolver.knownForType(type))).forEach((knownClass) => {
        const [tempClassName] = knownClass.split(':')[1];
        className = tempClassName;
        const classFactory = applicationInstance.factoryFor(knownClass).class;

        knownClasses[className] = classFactory;
      });

      known[type] = knownClasses;
    }

    return knownClasses;
  };

  applicationInstance.knownForType = knownForType;

  /**
    Returns array containing names of known classes for the specified type.

    @for ApplicationInstance
    @method knownNamesForType
    @param {String} type Type for which known names must be returned.
    @returns {String[]} Array containing names of known classes for the specified type.
  */
  const knownNamesForType = function (type) {
    return A(Object.keys(knownForType(type)));
  };

  applicationInstance.knownNamesForType = knownNamesForType;

  /**
    Checks if class with given name is known for the specified type.

    @for ApplicationInstance
    @method isKnownNameForType
    @param {String} type Type in which class existence must be checked.
    @param {String} [className] Class name.
    @returns {String[]} Flag indicating whether class with given name is known for the specified type or not.
  */
  const isKnownNameForType = function (type, className) {
    return knownNamesForType(type).includes(className);
  };

  applicationInstance.isKnownNameForType = isKnownNameForType;
}

export default {
  name: 'owner',
  initialize,
};
