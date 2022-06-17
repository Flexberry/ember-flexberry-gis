/**
  @module ember-flexberry-gis
*/

import EmberObject from '@ember/object';

/**
  Class implementing base stylization for vector layers.

  @class BaseLayerStyle
*/
export default EmberObject.extend({
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
  getVisibleLeafletLayers({ leafletLayer, }) {
    return [leafletLayer];
  },

  /**
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
  */
  renderOnLeafletLayer() {
    const message = "Method 'renderOnLeafletLayer' isn't implemented in 'base' layer-style";
    throw Object.assign(
      new Error(message)
    );
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
  */
  renderOnCanvas() {
    const message = "Method 'renderOnCanvas' isn't implemented in 'base' layer-style";
    throw Object.assign(
      new Error(message)
    );
  },
});
