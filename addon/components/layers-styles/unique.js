/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/unique';
import BaseCustomStyle from './categorized/base-custom-layer-style';

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
      for (let i = 0, len = propertyValues.length; i < len; i++) {
        categories.push({
          name: i,
          value: propertyValues[i],
          styleSettings: layersStylesRenderer.getDefaultStyleSettings('simple')
        });
      }

      this.set('styleSettings.style.categories', categories);
      this.set('_selectedCategories', {});
      this.set('_selectedCategoriesCount', 0);
      this.set('_allCategoriesAreSelected', false);
    }
  }
});
