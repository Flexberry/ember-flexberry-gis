/**
  @module ember-flexberry-gis
*/

import BaseLayerStyle from './-private/base';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';

/**
  Class implementing empty stylization for vector layers.
  This style makes vector layers invisible on map.

  @class EmptyLayerStyle
  @extends BaseLayerStyle
*/
export default BaseLayerStyle.extend({
  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @return {Object} Hash containing default style settings.
  */
  getDefaultStyleSettings() {
    return null;
  },

  /**
    Gets visible leaflet layers (those nested layers which 'layers-style' doesn't hide).

    @method getVisibleLeafletLayers
    @return {Object[]} Array containing visible leaflet layers (those nested layers which 'layers-style' doesn't hide).
  */
  getVisibleLeafletLayers({ leafletLayer, style }) {
    // There is no visible layers in 'empty' layers-style, all layer are hidden.
    return [];
  },

  /**
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, style }) {
    setLeafletLayerOpacity({ leafletLayer, opacity: 0 });
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
    // Nothing must be rendered on canvas for 'empty' layer style.
  }
});
