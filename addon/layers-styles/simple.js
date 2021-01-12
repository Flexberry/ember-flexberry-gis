/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayerStyle from './-private/base';

/**
  Class implementing simple stylization for vector layers.
  This style applies path and marker settings to vector layers.

  @class SimpleLayerStyle
  @extends BaseLayerStyle
*/
export default BaseLayerStyle.extend({
  /**
    Reference to 'markers-styles-renderer' service.

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
    if (Ember.isNone(path.styleIsSet) || !path.styleIsSet) {
      let pathStyle = style.path || {};
      pathStyle = Ember.$.extend(true, {}, pathStyle, {
        // Fill must be disabled for non polygon layers, because filled polylines and other lines-like geometries looks ugly in leaflet.
        fill: pathStyle.fill === true && path instanceof L.Polygon
      });

      path.setStyle(pathStyle);
    }
  },

  /**
    Applies layer-style to the specified leaflet marker.

    @method _renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#marker">L.Marker</a>} options.marker Leaflet marker to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  _renderOnLeafletMarker({ marker, style }) {
    this.get('markersStylesRenderer').renderOnLeafletMarker({ marker, styleSettings: style.marker });
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

        fillGradientEnable: false,

        strokeGradientEnable: false,

        // Stroke width in pixels
        weight: 3,

        // A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
        lineCap: 'round',

        // A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
        lineJoin: 'round',

        // A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray).
        // Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
        dashArray: '',

        // A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset).
        // Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
        dashOffset: 0,

        // Whether to fill the path with color.
        fill: true,

        // Fill color.
        fillColor: '#3388ff'
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
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, style, target }) {
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');

    // Clear canvas.
    ctx.clearRect(0, 0, width, height);

    // Set line dashig.
    let pathStyle = Ember.get(style, 'path') || {};
    let dashArray = Ember.get(pathStyle, 'dashArray');
    dashArray = Ember.isBlank(dashArray) ?
      [] :
      dashArray.split(',').map((value) => {
        return Number(value);
      }).filter((value) => {
        return !isNaN(value);
      });

    let dashOffset = Number(Ember.get(pathStyle, 'dashOffset'));
    dashOffset = isNaN(dashOffset) ? 0 : dashOffset;

    ctx.setLineDash(dashArray);
    ctx.lineDashOffset = dashOffset;

    // Render sample geometry.
    if (target === 'preview') {
      this._renderPreviewGeometryOnCanvas({ canvas });
    } else {
      this._renderLegendGeometryOnCanvas({ canvas });
    }

    // Set fill style.
    let fill = Ember.get(pathStyle, 'fill');
    if (fill) {
      // Fill opacity is always 1.
      ctx.globalAlpha = 1;

      let fillColor = Ember.get(pathStyle, 'fillColor');
      ctx.fillStyle = fillColor;

      ctx.fill();
    }

    // Set stroke style.
    let stroke = Ember.get(pathStyle, 'stroke');
    if (stroke) {
      // Stroke oapcity is always 1.
      ctx.globalAlpha = 1;

      let strokeWeight = Number(Ember.get(pathStyle, 'weight'));
      ctx.lineWidth = strokeWeight;

      let strokeColor = Ember.get(pathStyle, 'color');
      ctx.strokeStyle = strokeColor;

      let strokeLineCap = Ember.get(pathStyle, 'lineCap');
      ctx.lineCap = strokeLineCap;

      let strokeLineJoin = Ember.get(pathStyle, 'lineJoin');
      ctx.lineJoin = strokeLineJoin;

      ctx.stroke();
    }
  },

  /**
    Renderes specific preview geometry on canvas.

    @method _renderGeometryOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which geometry must be rendered.
    @private
  */
  _renderPreviewGeometryOnCanvas({ canvas }) {
    // Render sample polygon.
    let polygon = {
      type: 'Polygon',
      viewport: { width: 150, height: 150 },
      coordinates: [
        { x: 10, y: 40 },
        { x: 50, y: 20 },
        { x: 90, y: 30 },
        { x: 130, y: 10 },
        { x: 110, y: 70 },
        { x: 120, y: 100 },
        { x: 90, y: 120 },
        { x: 40, y: 110 }
      ]
    };
    this._renderGeometryOnCanvas({ canvas, geometry: polygon });

    // Render sample polyline.
    let polyline = {
      type: 'Polyline',
      viewport: { width: 150, height: 150 },
      coordinates: [
        { x: 20, y: 130 },
        { x: 130, y: 130 }
      ]
    };
    this._renderGeometryOnCanvas({ canvas, geometry: polyline });
  },

  /**
    Renderes specific legend geometry on canvas.

    @method _renderGeometryOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which geometry must be rendered.
    @private
  */
  _renderLegendGeometryOnCanvas({ canvas }) {
    // Render full-size rectangle.
    let rectangle = {
      type: 'Polygon',
      viewport: { width: 150, height: 150 },
      coordinates: [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
        { x: 150, y: 150 },
        { x: 0, y: 150 }
      ]
    };
    this._renderGeometryOnCanvas({ canvas, geometry: rectangle });
  },

  /**
    Renderes specified geometry on canvas.

    @method _renderGeometryOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which geometry must be rendered.
    @param {Object} options.geometry Hash containing geometry settings.
    @private
  */
  _renderGeometryOnCanvas({ canvas, geometry }) {
    let width = canvas.width;
    let height = canvas.height;
    let scale = Math.min(width / geometry.viewport.width, height / geometry.viewport.height);
    let xOffset = (width - geometry.viewport.width * scale) / 2;
    let yOffset = (height - geometry.viewport.height * scale) / 2;

    let ctx = canvas.getContext('2d');
    let type = geometry.type;
    let coordinates = geometry.coordinates;
    for (let i = 0, len = coordinates.length; i < len; i++) {
      let point = coordinates[i];
      let newPoint = { x: point.x * scale + xOffset, y: point.y * scale + yOffset };
      if (i === 0) {
        ctx.moveTo(newPoint.x, newPoint.y);
      } else {
        ctx.lineTo(newPoint.x, newPoint.y);
      }
    }

    if (type === 'Polygon') {
      ctx.closePath();
    }
  }
});
