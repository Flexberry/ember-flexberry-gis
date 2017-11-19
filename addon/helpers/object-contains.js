/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Object contains helper.
  Checks whether the object contains a specified key.

  @class ObjectContainsHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>
*/
export default Ember.Helper.extend({
  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic.

    @method compute
    @param {Object} obj Object in which key must be searched.
    @param {String} key Key which must be searched in the specified object.
    @return {Boolen} Flag: indicates whether the specified object contains the given key or not.
  */
  compute([obj, key]) {
    return obj.hasOwnProperty(key);
  }
});
