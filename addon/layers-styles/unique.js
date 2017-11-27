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
    propertyValue = propertyValue + '';
    let categoryValue = Ember.get(category, 'value') + '';

    return propertyValue === categoryValue;
  }
});
