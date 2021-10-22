/**
  @module ember-flexberry-gis
*/

import EmberObject, { get } from '@ember/object';

/**
  Base edit mode object.

  @class BaseEditMode
*/
export default EmberObject.extend({
  name: null,

  componentCanBeInserted(parentView) {
    let requiredProperties = get(this, 'requiredProperties');

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
