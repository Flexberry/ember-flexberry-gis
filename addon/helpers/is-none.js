/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';

import Helper from '@ember/component/helper';

/**
  Is none helper.
  Checks whether the specified value is null or undefined.

  @class IsNoneHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>
*/
export default Helper.extend({
  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic, returns arguments wrapped into array.

    @method compute
    @param {any} value Value which must be checked.
    @return {Boolen} Flag: indicates whether the specified item contains in the given array or not.
  */
  compute([value]) {
    return isNone(value);
  },
});
