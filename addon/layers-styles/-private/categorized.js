/**
  @module ember-flexberry-gis
*/

import { isArray } from '@ember/array';

import { get } from '@ember/object';
import { isNone, isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
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
  layersStylesRenderer: service('layers-styles-renderer'),

  /**
    Applies layer-style to the specified leaflet layer.

    @method _renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  _renderOnLeafletLayer({ leafletLayer, style, }) {
    if (leafletLayer instanceof L.LayerGroup) {
      // First we must clean group layer's style options,
      // otherwise already defined style options won't be changed.
      leafletLayer.options.style = {};

      leafletLayer.eachLayer((layer) => {
        this._renderOnLeafletLayer({ leafletLayer: layer, style, });
      });
    } else {
      const layersStylesRenderer = this.get('layersStylesRenderer');
      const relevantCategory = this._getCategoryRelevantToLeafletLayer({ leafletLayer, style, });

      if (isNone(relevantCategory)) {
        // There is no relevant category for the specified laeflet layer, so empty style will be applied to it.
        layersStylesRenderer.renderOnLeafletLayer({ leafletLayer, styleSettings: layersStylesRenderer.getDefaultStyleSettings('empty'), });
      } else {
        // Style from relevant category will be applied to the specified laeflet layer.
        layersStylesRenderer.renderOnLeafletLayer({ leafletLayer, styleSettings: relevantCategory.styleSettings, });
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
  _getCategoryRelevantToLeafletLayer({ leafletLayer, style, }) {
    style = style || {};
    const propertyName = get(style, 'propertyName');
    const categories = get(style, 'categories');
    if (!isArray(categories) || isBlank(propertyName)) {
      return null;
    }

    let relevantCategory = null;
    for (let i = 0, len = categories.length; i < len; i++) {
      const category = categories[i];
      if (this._categoryIsRelevantToLeafletLayer({ leafletLayer, propertyName, category, })) {
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
  _categoryIsRelevantToLeafletLayer({ leafletLayer, propertyName, category, }) {
    const featureProperties = get(leafletLayer, 'feature.properties');
    if (isNone(featureProperties)) {
      return false;
    }

    // Get property value.
    const propertyValue = get(featureProperties, propertyName);

    return this.categoryIsRelevantToPropertyValue({ propertyValue, category, });
  },

  /**
    Checks if specified category is relevant to the specified property value.

    @method categoryIsRelevantToPropertyValue
    @return {Boolean} Flag indicating whether specified category is relevant to the specified property value.
  */
  categoryIsRelevantToPropertyValue() {
    const message = 'Method \'categoryIsRelevantToPropertyValue\' isn\'t implemented in the specified categorized layers-style';
    throw Object.assign(
      new Error(message)
    );
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
      categories: [],
    };
  },

  /**
    Gets visible leaflet layers (those nested layers which 'layers-style' doesn't hide).

    @method getVisibleLeafletLayers
    @return {Object[]} Array containing visible leaflet layers (those nested layers which 'layers-style' doesn't hide).
  */
  getVisibleLeafletLayers({ leafletLayer, style, visibleLeafletLayers, }) {
    visibleLeafletLayers = visibleLeafletLayers || [];

    if (leafletLayer instanceof L.LayerGroup) {
      leafletLayer.eachLayer((layer) => {
        this.getVisibleLeafletLayers({ leafletLayer: layer, style, visibleLeafletLayers, });
      });
    } else {
      const relevantCategory = this._getCategoryRelevantToLeafletLayer({ leafletLayer, style, });
      if (!isNone(relevantCategory)) {
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
  renderOnLeafletLayer({ leafletLayer, style, }) {
    style = style || {};
    this._renderOnLeafletLayer({ leafletLayer, style, });
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
  */
  renderOnCanvas() {
  },
});
