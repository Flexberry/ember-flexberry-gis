/**
  @module ember-flexberry-gis
*/

/**
  Base edit mode object.

  @class BaseEditMode
*/
export default {
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
}
