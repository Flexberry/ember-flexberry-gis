/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMarkerStyle from './-private/base';

/**
  Class implementing default stylization for markers.

  @class DefaultMarkerStyle
  @extends BaseMarkerStyle
*/
export default BaseMarkerStyle.extend({
  /**
    Reference to 'markers-styles-renderer' service.

    @property _markersStylesRenderer
    @type MarkersStylesRendererService
    @private
  */
  _markersStylesRenderer: Ember.inject.service('markers-styles-renderer'),

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

    @method renderOnLeafletMarker
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#marker">L.Marker</a>} options.marker Leaflet marker to which marker-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletMarker({ marker, style }) {
    if (Ember.isNone(marker.styleIsSet) || !marker.styleIsSet) {
      marker.setIcon(new L.Icon.Default());
    }
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which marker-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, style, target }) {
    // Default 'image' markers-style's settings are settings for leaflet default image icon (L.Icon.Default),
    // so we can reuse 'image' markers-style here.
    let markersStylesRenderer = this.get('_markersStylesRenderer');
    let defaultMarkerStyleSettings = markersStylesRenderer.getDefaultStyleSettings('image');
    markersStylesRenderer.renderOnCanvas({ canvas, styleSettings: defaultMarkerStyleSettings, target });
  }
});
