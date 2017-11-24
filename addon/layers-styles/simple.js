/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayerStyle from './-private/base';

/**
  Class implementing empty stylization for vector layers.
  This style makes vector layers invisible on map.

  @class SimpleLayerStyle
  @extends BaseLayerStyle
*/
export default BaseLayerStyle.extend({
  /**
    Reference to 'markers-styles-renderer' servie.

    @property markersStylesRenderer
    @type MarkersStylesRendererService
  */
  markersStylesRenderer: Ember.inject.service('markers-styles-renderer'),

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
    } else if (leafletLayer instanceof L.Path) {
      this._renderOnLeafletPath({ path: leafletLayer, style });
    } else if (leafletLayer instanceof L.Marker) {
      this._renderOnLeafletMarker({ marker: leafletLayer, style });
    }
  },

  /**
    Applies layer-style to the specified leaflet path.

    @method _renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#path">L.Path</a>} options.path Leaflet path to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  _renderOnLeafletPath({ path, style }) {
    let pathStyle = style.path || {};
    pathStyle = Ember.$.extend(true, {}, pathStyle, {
      // Fill must be disabled for non polygon layers, because filled polylines and other lines-like geometries looks ugly in leaflet.
      fill: pathStyle.fill === true && path instanceof L.Polygon
    });

    path.setStyle(pathStyle);
  },

  /**
    Applies layer-style to the specified leaflet marker.

    @method _renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#marker">L.Marker</a>} options.marker Leaflet marker to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  _renderOnLeafletMarker({ marker, style }) {
    this.get('markersStylesRenderer').renderOnLeafletMarker({ marker, style: style.marker });
  },

  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @return {Object} Hash containing default style settings.
  */
  getDefaultStyleSettings() {
    return {
      path: {
        // Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
        stroke: true,

        // Stroke color
        color: '#3388ff',

        // Stroke width in pixels
        weight: 3,

        // A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
        lineCap: 'round',

        // A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
        lineJoin: 'round',

        // A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray).
        // Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
        dashArray: null,

        // A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset).
        // Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
        dashOffset: null,

        // Whether to fill the path with color.
        fill: true,

        // Fill color.
        fillColor: '#3388ff',

        // A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
        fillRule: 'evenodd'
      },
      marker: this.get('markersStylesRenderer').getDefaultStyleSettings('default')
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
    style = style || {};
    this._renderOnLeafletLayer({ leafletLayer, style });
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnCanvas({ canvas, style }) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '24px Verdana';
    context.strokeStyle = 'red';
    context.strokeText('Path preview', 10, 20);
  }
});
