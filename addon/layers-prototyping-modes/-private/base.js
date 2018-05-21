/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Base edit mode object.

  @class BaseEditMode
*/
export default Ember.Object.extend({
  name: null,

  componentCanBeInserted(parentView) {
    let requiredProperties = Ember.get(this, 'requiredProperties');

    requiredProperties.forEach((property) => {
      let value = parentView.get(property);

      // Throw assertion failed exception, if value is not defined for required property.
      if (value === null || value === undefined) {
        return false;
      }
    }, this);

    return true;
  }
});
