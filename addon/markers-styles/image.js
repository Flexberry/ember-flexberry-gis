/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
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
      shadowAnchor: [12, 41]
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
    if (Ember.isNone(marker.styleIsSet) || !marker.styleIsSet) {
      marker.setIcon(new L.Icon(style));
    }
  },

  getAnchor(style) {
    let aW = 0.5;
    let aH = 0.5;

    if (!Ember.isNone(style)) {
      aW = style.iconAnchor[0];
      aH = style.iconAnchor[1];
    }

    return [Math.round(Number(style.iconSize[0]) * aW), Math.round(Number(style.iconSize[1]) * aH)];
  },

  /**
    Renderes marker-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which marker-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, style, target, scale }) {
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');

    // Clear canvas.
    ctx.clearRect(0, 0, width, height);

    var iconImage = new Image();
    let _this = this;
    iconImage.onload = function() {
      // Draw loaded image.
      let iconWidth = style.iconSize[0] || iconImage.width;
      let iconHeight = style.iconSize[1] || iconImage.height;
      let xOffset = 0;
      let yOffset = 0;

      let anchor = _this.getAnchor(style);
      xOffset = width/2 - anchor[0] * scale;
      yOffset = height/2 - anchor[1] * scale;

      let drawIconImage = function() {
        ctx.drawImage(iconImage, xOffset, yOffset, iconWidth * scale, iconHeight * scale);
      };

      if (Ember.isBlank(style.shadowUrl)) {
        drawIconImage();
      } else {
        let shadowImage = new Image();
        shadowImage.onload = function() {
          // Draw shadow icon.
          let shadowWidth = style.shadowSize[0] || shadowImage.width;
          let sadowHeight = style.shadowSize[1] || shadowImage.height;

          let xShadowOffset = style.iconAnchor[0] - style.shadowAnchor[0];
          let yShadowOffset = style.iconAnchor[1] - style.shadowAnchor[1];
          ctx.drawImage(shadowImage, xOffset + xShadowOffset, yOffset + yShadowOffset, shadowWidth * scale, sadowHeight * scale);

          // Draw marker icon.
          drawIconImage();
        };

        shadowImage.onerror = function() {
          // Shadow is optional, so draw marker icon anyway.
          drawIconImage();
        };

        // Set shadow image src to start loading.
        shadowImage.src = style.shadowUrl;
      }
    };

    iconImage.onerror = function() {
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
    iconImage.src = style.iconUrl;
  }
});
