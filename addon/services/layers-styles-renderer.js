/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Layers styles renderer service.

  @class LayersStylesRendererService
  @extends Ember.Service
*/
export default Ember.Service.extend({
  /**
    Hash containing cached instances of available layers styles.

    @property _layersStyles
    @type Object
    @default null
    @private
  */
  _layersStyles: null,

  /**
    Array containing cached names of available layers styles.

    @property _layersStylesTypes
    @type String[]
    @default null
    @private
  */
  _layersStylesTypes: null,

  /**
    Gets layer style.

    @method _getLayerStyle
    @param {String} type Layer style type.
    @return {Object} layer style.
  */
  _getLayerStyle(type) {
    let layerStyle = this.get(`_layersStyles.${type}`);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't find '${type}' layers-style, it doesn't exist.`);
    }

    return layerStyle;
  },

  /**
    Initializes service.
  */
  init() {
    this._super(...arguments);

    let availableLayersStyles = {};
    let owner = Ember.getOwner(this);
    let availableLayerStylesTypes = owner.knownNamesForType(`layers-style`);
    availableLayerStylesTypes.forEach((type) => {
      availableLayersStyles[type] = owner.lookup(`layers-style:${type}`);
    });

    this.set('_layersStyles', availableLayersStyles);
    this.set('_layersStylesTypes', availableLayerStylesTypes);
  },

  /**
    Gets available layer styles types.

    @method getAvailableLayerStylesTypes
    @param {String} type Layer style type.
    @return {Strng[]} Array containing available 'layers-styles' types.
  */
  getAvailableLayerStylesTypes() {
    return this.get('_layersStylesTypes');
  },

  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @param {String} type Layer style type.
    @return {Object} Hash containing style type and it's default style settings (for example { type: 'simple', style: { fill: ..., stroke: ..., ... } }).
  */
  getDefaultStyleSettings(type) {
    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't get default style settings for '${type}' layers-style.`);
      return null;
    }

    return {
      type: type,
      style: layerStyle.getDefaultStyleSettings()
    };
  },

  /**
    Gets visible leaflet layers (those nested layers which 'layers-style' doesn't hide).

    @method getVisibleLeafletLayers
    @return {Object[]} Array containing visible leaflet layers (those nested layers which 'layers-style' doesn't hide).
  */
  getVisibleLeafletLayers({ leafletLayer, styleSettings }) {
    let type = Ember.get(styleSettings, 'type');
    let style = Ember.get(styleSettings, 'style');

    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't get visible leaflet layers for  '${type}' layers-style.`);
      return [];
    }

    return layerStyle.getVisibleLeafletLayers({ leafletLayer, style });
  },

  /**
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
    @param {Object} options Method options.
    @param {String} options.type Layer style type.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.styleSettings Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, styleSettings }) {
    let type = Ember.get(styleSettings, 'type');
    let style = Ember.get(styleSettings, 'style');

    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't render '${type}' layers-style on leaflet layer.`);
      return;
    }

    layerStyle.renderOnLeafletLayer({ leafletLayer, style });
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.styleSettings Hash containing style settings.
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, styleSettings, target }) {
    target = target || 'preview';

    let type = Ember.get(styleSettings, 'type');
    let style = Ember.get(styleSettings, 'style');

    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't render '${type}' layers-style on canvas.`);
      return;
    }

    layerStyle.renderOnCanvas({ canvas, style, target });
  }
});
