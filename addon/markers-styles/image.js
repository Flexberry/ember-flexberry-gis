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
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, style, target }) {
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');

    // Clear canvas.
    ctx.clearRect(0, 0, width, height);

    var image = new Image();
    image.onload = function() {
      // Draw loaded image.
      let iconWidth = style.iconSize[0] || this.width;
      let iconHeight = style.iconSize[1] || this.height;

      let scale = iconWidth > width || iconHeight > height ?
        Math.min(width / iconWidth, height / iconHeight) :
        1;
      let xOffset = (width - iconWidth * scale) / 2;
      let yOffset = (height - iconHeight * scale) / 2;

      ctx.drawImage(this, xOffset, yOffset, iconWidth * scale, iconHeight * scale);
    };

    image.onerror = function() {
      // Draw red cross instead of image.
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);

      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ff0000';
      ctx.stroke();
    };

    // Set image src to start loading.
    image.src = style.iconUrl;
  }
});
