/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Array contains helper.
  Checks whether the specified item contains in the given array or not.

  @class ArrayContainsHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>
*/
export default Ember.Helper.extend({
  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic, returns arguments wrapped into array.

    @method compute
    @param {Array} array Array in which item must be searched.
    @param {any} item Item which must be searched in the specified array.
    @return {Boolen} Flag: indicates whether the specified item contains in the given array or not.
  */
  compute([array, item]) {
    return Ember.A(array || []).contains(item);
  }
});
