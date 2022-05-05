/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import { get } from '@ember/object';
import CategorizedLayerStyle from './-private/categorized';

/**
  Class implementing categorized by unique values stylization for vector layers.

  @class UniqueLayerStyle
  @extends CategorizedLayerStyle
*/
export default CategorizedLayerStyle.extend({
  /**
    Checks if specified category is relevant to the specified property value.

    @method categoryIsRelevantToPropertyValue
    @param {Object} options Method options.
    @param {*} options.propertyValue Property value.
    @param {Object} options.category Hash containing category settings.
    @return {Boolean} Flag indicating whether specified category is relevant to the specified property value.
  */
  categoryIsRelevantToPropertyValue({ propertyValue, category, }) {
    // Graduated categorization can be performed only by numeric properties.
    propertyValue = Number(propertyValue);
    if (Number.isNaN(propertyValue)) {
      return false;
    }

    // Category value is serialized interval in format '< 10' or '> 1' or '<= 10' or '<= 10' or '1 - 10'.
    let categoryInterval = get(category, 'value');
    if (isBlank(categoryInterval)) {
      return false;
    }

    // Cast to string.
    categoryInterval += '';

    // Check if interval has format of '<= 10'.
    if (categoryInterval.indexOf('<=') >= 0) {
      const interval = categoryInterval.split('<=');
      const endIntervalValue = Number(interval[1]);
      if (Number.isNaN(endIntervalValue)) {
        return false;
      }

      return propertyValue <= endIntervalValue;
    }

    // Check if interval has format of '>= 1'.
    if (categoryInterval.indexOf('>=') >= 0) {
      const interval = categoryInterval.split('>=');
      const startIntervalValue = Number(interval[1]);
      if (Number.isNaN(startIntervalValue)) {
        return false;
      }

      return propertyValue >= startIntervalValue;
    }

    // Check if interval has format of '< 10'.
    if (categoryInterval.indexOf('<') >= 0) {
      const interval = categoryInterval.split('<');
      const endIntervalValue = Number(interval[1]);
      if (Number.isNaN(endIntervalValue)) {
        return false;
      }

      return propertyValue < endIntervalValue;
    }

    // Check if interval has format of '> 1'.
    if (categoryInterval.indexOf('>') >= 0) {
      const interval = categoryInterval.split('>');
      const startIntervalValue = Number(interval[1]);
      if (Number.isNaN(startIntervalValue)) {
        return false;
      }

      return propertyValue > startIntervalValue;
    }

    // Check if interval has format of '1 - 10'.
    if (categoryInterval.indexOf('-') >= 0) {
      const interval = categoryInterval.split('-');

      let i = 0;
      let startIntervalValue = interval[i].trim();
      if (isBlank(startIntervalValue)) {
        // Blank string after split('-') means that there was negative number.
        i += 1;
        startIntervalValue = `-${interval[i]}`;
      }

      startIntervalValue = Number(startIntervalValue);
      if (Number.isNaN(startIntervalValue)) {
        return false;
      }

      i += 1;
      let endIntervalValue = interval[i].trim();
      if (isBlank(endIntervalValue)) {
        // Blank string after split('-') means that there was negative number.
        i += 1;
        endIntervalValue = `-${interval[i]}`;
      }

      endIntervalValue = Number(endIntervalValue);
      if (Number.isNaN(endIntervalValue)) {
        return false;
      }

      return propertyValue >= startIntervalValue && propertyValue <= endIntervalValue;
    }
  },
});
