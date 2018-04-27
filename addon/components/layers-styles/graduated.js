/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/graduated';
import BaseCustomStyle from './categorized/base-categorized-layer-style';
import { getGradientColors } from 'ember-flexberry-gis/utils/color-interpolation';

/**
  Component containing GUI for 'graduated' layers-style

  @class GraduatedLayersStyleComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default BaseCustomStyle.extend({
  /**
    Count of categories to which layer's features must be classified.

    @property _classificationCategoriesCount
    @type Number
    @default 1
    @private
  */
  _classificationCategoriesCount: 1,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['graduated-layers-style']
  */
  classNames: ['graduated-layers-style'],

  actions: {
    /**
      Handles 'classify' button click event.

      @method actions.onClassifyButtonClick
      @param {Object} e Event object.
    */
    onClassifyButtonClick() {
      let layerType = this.get('layerType');
      let leafletLayer = this.get('leafletLayer');
      if (Ember.isBlank(layerType) || Ember.isNone(leafletLayer)) {
        return;
      }

      let layerClass = Ember.getOwner(this).lookup(`layer:${layerType}`);
      let propertyName = this.get('styleSettings.style.propertyName');

      // Get distinct array of asc. sorted values.
      let propertyValues = [...new Set(layerClass.getLayerPropertyValues(leafletLayer, propertyName))].sort((a, b) => { return a - b; });
      let categoriesCount = Number(this.get('_classificationCategoriesCount'));
      categoriesCount = isNaN(categoriesCount) ? 1 : categoriesCount;
      categoriesCount = categoriesCount <= 0 ? 1 : categoriesCount;
      categoriesCount = categoriesCount > propertyValues.length ? propertyValues.length : categoriesCount;
      let categories = [];
      let categoriesLength = (propertyValues.length - propertyValues.length % categoriesCount) / categoriesCount;
      let layersStylesRenderer = this.get('_layersStylesRenderer');
      let fillGradientColors =  this.get('_fillGradientEnable') ? getGradientColors(this.get('_fillGradientColorStart'), this.get('_fillGradientColorEnd'), categoriesCount) : [];
      let strokeGradientColors =  this.get('_strokeGradientEnable') ? getGradientColors(this.get('_strokeGradientColorStart'), this.get('_strokeGradientColorEnd'), categoriesCount) : [];

      for (let i = 0; i < categoriesCount; i++) {
        let intervalStartIndex = i * categoriesLength;
        let intervalLastIndex = i === (categoriesCount - 1) ? propertyValues.length - 1 : (i + 1) * categoriesLength - 1;
        let styleSettings = layersStylesRenderer.getDefaultStyleSettings('simple');
        styleSettings.style.path.fillColor = (fillGradientColors[i] != null) ? fillGradientColors[i] : styleSettings.style.path.fillColor;
        styleSettings.style.path.color = (strokeGradientColors[i] != null) ? strokeGradientColors[i] : styleSettings.style.path.color;
        categories.push({
          name: i,
          value: propertyValues[intervalStartIndex] + ' - ' + propertyValues[intervalLastIndex],
          styleSettings: styleSettings
        });
      }

      this.set('styleSettings.style.categories', categories);
      this.set('_selectedCategories', {});
      this.set('_selectedCategoriesCount', 0);
      this.set('_allCategoriesAreSelected', false);
      this.set('_classificationCategoriesCount', categoriesCount);
    }
  }
});
