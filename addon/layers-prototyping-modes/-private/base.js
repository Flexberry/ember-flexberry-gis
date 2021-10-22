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
    const requiredProperties = get(this, 'requiredProperties');

    requiredProperties.forEach((property) => {
      const value = parentView.get(property);

      // Throw assertion failed exception, if value is not defined for required property.
      if (value === null || value === undefined) {
        return false;
      }
    }, this);

    return true;
  },
});
