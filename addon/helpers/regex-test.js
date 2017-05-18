/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Regex tester helper.
  Checks whether the specified item matching provided regex expression

  @class RegexTestHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>
*/
export default Ember.Helper.extend({
  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic, returns arguments wrapped into array.

    @method compute
    @param {String} item Item which should be tested.
    @param {String} expression Regular expression WITHOUT ESCAPES to test provided item.
    @return {Boolen} Flag: indicates whether the specified item suits provided regular expression
  */
  compute([item, expression]) {
    if (item) {
      let regEx = new RegExp(expression);

      return !Ember.isBlank(item.toString().match(regEx));
    }

    return false;
  }
});
