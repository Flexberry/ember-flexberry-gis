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

    // Category value is serialized interval in format '1 - 10'.
    let categoryInterval = Ember.get(category, 'value');
    if (Ember.isBlank(categoryInterval)) {
      return false;
    }

    // Cast to string and check if interval has format of '1 - 10'.
    categoryInterval += '';
    if (categoryInterval.indexOf('-') === -1) {
      return false;
    }

    // Parse interval's start and end values.
    let interval = categoryInterval.split('-');
    let startIntervalValue = Number(interval[0]);
    let endIntervalValue = Number(interval[1]);
    if (isNaN(startIntervalValue) || isNaN(endIntervalValue)) {
      return false;
    }

    return propertyValue >= startIntervalValue && propertyValue <= endIntervalValue;
  }
});
