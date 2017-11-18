/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayerStyle from './-private/base';

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
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, style }) {
    if (!leafletLayer.setStyle) {
      Ember.Logger.error(`Specified leaflet layer doesn't implement 'setStyle' method, so 'empty' layers-style can't be rendered on it.`);
      return;
    }

    leafletLayer.setStyle({
      opacity: 0,
      fillOpacity: 0
    });
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnCanvas({ canvas, style }) {
    // Nothing must be rendered on canvas for 'empty' layer style.
  }
});
