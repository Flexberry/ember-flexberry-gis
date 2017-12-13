/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayerStyle from './base';

/**
  Class implementing categorized stylization for vector layers.

  @class CategorizedLayerStyle
  @extends BaseLayerStyle
*/
export default BaseLayerStyle.extend({
  /**
    Reference to 'layers-styles-renderer' service.

    @property laysersStylesRenderer
    @type LayersStylesRendererService
  */
  layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Applies layer-style to the specified leaflet layer.

    @method _renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  _renderOnLeafletLayer({ leafletLayer, style }) {
    if (leafletLayer instanceof L.LayerGroup) {
      // First we must clean group layer's style options,
      // otherwise already defined style options won't be changed.
      leafletLayer.options.style = {};

      leafletLayer.eachLayer((layer) => {
        this._renderOnLeafletLayer({ leafletLayer: layer, style });
      });
    } else {
      let layersStylesRenderer = this.get('layersStylesRenderer');
      let relevantCategory = this._getCategoryRelevantToLeafletLayer({ leafletLayer, style });

      if (Ember.isNone(relevantCategory)) {
        // There is no relevant category for the specified laeflet layer, so empty style will be applied to it.
        layersStylesRenderer.renderOnLeafletLayer({ leafletLayer, styleSettings: layersStylesRenderer.getDefaultStyleSettings('empty') });
      } else {
        // Style from relevant category will be applied to the specified laeflet layer.
        layersStylesRenderer.renderOnLeafletLayer({ leafletLayer, styleSettings: relevantCategory.styleSettings });
      }
    }
  },

  /**
    Gets category relevant to the specified leaflet layer.

    @method _getCategoryRelevantToLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer.
    @param {Object} options.style Hash containing style settings.
    @return {Object} Hash containing category settings relevant to the specified leaflet layer.
    @private
  */
  _getCategoryRelevantToLeafletLayer({ leafletLayer, style }) {
    style = style || {};
    let propertyName = Ember.get(style, 'propertyName');
    let categories = Ember.get(style, 'categories');
    if (!Ember.isArray(categories) || Ember.isBlank(propertyName)) {
      return null;
    }

    let relevantCategory = null;
    for (let i = 0, len = categories.length; i < len; i++) {
      let category = categories[i];
      if (this._categoryIsRelevantToLeafletLayer({ leafletLayer, propertyName, category })) {
        relevantCategory = category;
        break;
      }
    }

    return relevantCategory;
  },

  /**
    Checks if specified category is relevant to the specified leaflet layer.

    @method _categoryIsRelevantForLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer.
    @param {String} options.propertyName Layer property name.
    @param {Object} options.category Hash containing category settings.
    @return {Boolean} Flag indicating whether specified category is relevant to the specified laeflet layer.
  */
  _categoryIsRelevantToLeafletLayer({ leafletLayer, propertyName, category }) {
    let featureProperties = Ember.get(leafletLayer, 'feature.properties');
    if (Ember.isNone(featureProperties)) {
      return false;
    }

    // Get property value.
    let propertyValue = Ember.get(featureProperties, propertyName);

    return this.categoryIsRelevantToPropertyValue({ propertyValue, category });
  },

  /**
    Checks if specified category is relevant to the specified property value.

    @method categoryIsRelevantToPropertyValue
    @param {Object} options Method options.
    @param {*} options.propertyValue Property value.
    @param {Object} options.category Hash containing category settings.
    @return {Boolean} Flag indicating whether specified category is relevant to the specified property value.
  */
  categoryIsRelevantToPropertyValue({ propertyValue, category }) {
    throw 'Method \'categoryIsRelevantToPropertyValue\' isn\'t implemented in the specified categorized layers-style';
  },

  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @return {Object} Hash containing default style settings.
  */
  getDefaultStyleSettings() {
    return {
      // Property name on which values depends layer's style.
      propertyName: null,

      // Array containing categories description ({ name: 'Category name', value: 'Layer property value related to category', styleSettings: { ... }}).
      categories: []
    };
  },

  /**
    Gets visible leaflet layers (those nested layers which 'layers-style' doesn't hide).

    @method getVisibleLeafletLayers
    @return {Object[]} Array containing visible leaflet layers (those nested layers which 'layers-style' doesn't hide).
  */
  getVisibleLeafletLayers({ leafletLayer, style, visibleLeafletLayers }) {
    visibleLeafletLayers = visibleLeafletLayers || [];

    if (leafletLayer instanceof L.LayerGroup) {
      leafletLayer.eachLayer((layer) => {
        this.getVisibleLeafletLayers({ leafletLayer: layer, style, visibleLeafletLayers });
      });
    } else {
      let relevantCategory = this._getCategoryRelevantToLeafletLayer({ leafletLayer, style });
      if (!Ember.isNone(relevantCategory)) {
        visibleLeafletLayers.push(leafletLayer);
      }
    }

    return visibleLeafletLayers;
  },

  /**
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, style }) {
    style = style || {};
    this._renderOnLeafletLayer({ leafletLayer, style });
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, style, target }) {
  }
});
