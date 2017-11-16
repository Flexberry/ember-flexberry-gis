/**
  @module ember-flexberry-gis
*/

import BaseLayerStyle from './-private/base';

/**
  Class implementing empty stylization for vector layers.
  This style makes vector layers invisible on map.

  @class SimpleLayerStyle
  @extends BaseLayerStyle
*/
export default BaseLayerStyle.extend({
  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @return {Object} Hash containing default style settings.
  */
  getDefaultStyleSettings() {
    return {
      fill: {
        fill: true,
        fillColor: '#109bfc',
        fillOpacity: 1
      },
      stroke: {
        stroke: true,
        color: '#000000',
        weight: 1,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: null,
        dashOffset: null,
      },
      imageMarker: {
        imageMarker: true,
        opacity: 1,
        iconUrl: 'marker-icon.png',
        iconRetinaUrl: 'marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowUrl: 'marker-shadow.png',
        shadowRetinaUrl: null,
        shadowSize: [41, 41],
        shadowAnchor: null
      },
      divMarker: {
        divMarker: false,
        opacity: 1,
        iconSize: [12, 12],
        html: '',
        bgPos: null
      }
    };
  },

  /**
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, style }) {
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnCanvas({ canvas, style }) {
  }
});
