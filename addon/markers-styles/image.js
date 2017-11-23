/**
  @module ember-flexberry-gis
*/

import BaseMarkerStyle from './-private/base';

/**
  Class implementing default stylization for markers.

  @class ImageMarkerStyle
  @extends BaseMarkerStyle
*/
export default BaseMarkerStyle.extend({
  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @return {Object} Hash containing default style settings.
  */
  getDefaultStyleSettings() {
    return {
      // Marker icon URL.
      iconUrl: L.Icon.Default.imagePath + 'marker-icon.png',

      // Icon size.
      iconSize: [25, 41],

      // Icon anchor relative to it's size.
      iconAnchor: [12, 41],

      // Marker shadow icon URL.
      shadowUrl: L.Icon.Default.imagePath + 'marker-shadow.png',

      // Shadow icon size.
      shadowSize: [41, 41],

      // Shadow icon anchor relative to it's size.
      shadowAnchor: null
    };
  },

  /**
    Applies marker-style to the specified leaflet marker.

    @method renderOnLeafletMarker
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#marker">L.Marker</a>} options.marker Leaflet marker to which marker-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletMarker({ marker, style }) {
    marker.setIcon(new L.Icon(style));
  },

  /**
    Renderes marker-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which marker-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnCanvas({ canvas, style }) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '24px Verdana';
    context.strokeStyle = 'red';
    context.strokeText('Image marker preview', 10, 20);
  }
});
