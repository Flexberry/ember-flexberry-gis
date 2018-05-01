/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/unique';
import BaseCustomStyle from './categorized/base-categorized-layer-style';
import { getGradientColors } from 'ember-flexberry-gis/utils/color-interpolation';

/**
  Component containing GUI for 'unique' layers-style

  @class UniqueLayersStyleComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default BaseCustomStyle.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['unique-layers-style']
  */
  classNames: ['unique-layers-style'],

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
      let propertyValues = layerClass.getLayerPropertyValues(leafletLayer, propertyName);
      let categories = [];
      let layersStylesRenderer = this.get('_layersStylesRenderer');

      let fillGradientColors =  this.get('_fillGradientEnable') ?
       getGradientColors(this.get('_fillGradientColorStart'), this.get('_fillGradientColorEnd'), propertyValues.length) : [];

      let strokeGradientColors =  this.get('_strokeGradientEnable') ?
       getGradientColors(this.get('_strokeGradientColorStart'), this.get('_strokeGradientColorEnd'), propertyValues.length) : [];

      for (let i = 0, len = propertyValues.length; i < len; i++) {
        let styleSettings = layersStylesRenderer.getDefaultStyleSettings('simple');
        styleSettings.style.path.fillColor = (fillGradientColors[i] != null) ? fillGradientColors[i] : styleSettings.style.path.fillColor;
        styleSettings.style.path.color = (strokeGradientColors[i] != null) ? strokeGradientColors[i] : styleSettings.style.path.color;
        categories.push({
          name: i,
          value: propertyValues[i],
          styleSettings: styleSettings
        });
      }

      this.set('styleSettings.style.categories', categories);
      this.set('_selectedCategories', {});
      this.set('_selectedCategoriesCount', 0);
      this.set('_allCategoriesAreSelected', false);
    }
  }
});
