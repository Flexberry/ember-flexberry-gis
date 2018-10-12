/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
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
  categoryIsRelevantToPropertyValue({ propertyValue, category }) {
    // Graduated categorization can be performed only by numeric properties.
    propertyValue = Number(propertyValue);
    if (isNaN(propertyValue)) {
      return false;
    }

    // Category value is serialized interval in format '< 10' or '> 1' or '<= 10' or '<= 10' or '1 - 10'.
    let categoryInterval = Ember.get(category, 'value');
    if (Ember.isBlank(categoryInterval)) {
      return false;
    }

    // Cast to string.
    categoryInterval += '';

    // Check if interval has format of '<= 10'.
    if (categoryInterval.indexOf('<=') >= 0) {
      let interval = categoryInterval.split('<=');
      let endIntervalValue = Number(interval[1]);
      if (isNaN(endIntervalValue)) {
        return false;
      }

      return propertyValue <= endIntervalValue;
    }

    // Check if interval has format of '>= 1'.
    if (categoryInterval.indexOf('>=') >= 0) {
      let interval = categoryInterval.split('>=');
      let startIntervalValue = Number(interval[1]);
      if (isNaN(startIntervalValue)) {
        return false;
      }

      return propertyValue >= startIntervalValue;
    }

    // Check if interval has format of '< 10'.
    if (categoryInterval.indexOf('<') >= 0) {
      let interval = categoryInterval.split('<');
      let endIntervalValue = Number(interval[1]);
      if (isNaN(endIntervalValue)) {
        return false;
      }

      return propertyValue < endIntervalValue;
    }

    // Check if interval has format of '> 1'.
    if (categoryInterval.indexOf('>') >= 0) {
      let interval = categoryInterval.split('>');
      let startIntervalValue = Number(interval[1]);
      if (isNaN(startIntervalValue)) {
        return false;
      }

      return propertyValue > startIntervalValue;
    }

    // Check if interval has format of '1 - 10'.
    if (categoryInterval.indexOf('-') >= 0) {
      let interval = categoryInterval.split('-');

      let i = 0;
      let startIntervalValue = interval[i].trim();
      if (Ember.isBlank(startIntervalValue)) {
        // Blank string after split('-') means that there was negative number.
        i++;
        startIntervalValue = '-' + interval[i];
      }

      startIntervalValue = Number(startIntervalValue);
      if (isNaN(startIntervalValue)) {
        return false;
      }

      i++;
      let endIntervalValue = interval[i].trim();
      if (Ember.isBlank(endIntervalValue)) {
        // Blank string after split('-') means that there was negative number.
        i++;
        endIntervalValue = '-' + interval[i];
      }

      endIntervalValue = Number(endIntervalValue);
      if (isNaN(endIntervalValue)) {
        return false;
      }

      return propertyValue >= startIntervalValue && propertyValue <= endIntervalValue;
    }
  }
});
