/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Ember guidFor helper.
  Returns result of the Ember.guidFor(obj) method.

  @class EmberGuidHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>
*/
export default Ember.Helper.extend({
  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic, returns arguments wrapped into array.

    @method compute
    @param {Object} obj Object to calculate Ember guid.
    @return {String} Ember guid for the passed object.
  */
  compute([obj]) {
    return Ember.guidFor(obj);
  }
});
