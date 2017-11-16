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
      throw `Can't find '${type}' layer-style, it isn't implemented`;
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

    @method getDefaultStyleSettings
    @param {String} type Layer style type.
    @return {Object} Hash containing style type and it's default style settings (for example { type: 'simple', style: { fill: ..., stroke: ..., ... } }).
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
    return {
      type: type,
      style: layerStyle.getDefaultStyleSettings()
    };
  },

  /**
    Applies layer-style to the specified leaflet layer.

    @method applyStyleToLeafletLayer
    @param {Object} options Method options.
    @param {String} options.type Layer style type.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.styleSettings Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, styleSettings }) {
    let type = Ember.get(styleSettings, 'type');
    let style = Ember.get(styleSettings, 'style');
    let layerStyle = this._getLayerStyle(type);

    layerStyle.renderOnLeafletLayer({ leafletLayer, style });
  },

  /**
    Renderes layer-style preview on the specified canvas element.

    @method applyStyleToLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.styleSettings Hash containing style settings.
  */
  renderOnCanvas({ canvas, styleSettings }) {
    let type = Ember.get(styleSettings, 'type');
    let style = Ember.get(styleSettings, 'style');
    let layerStyle = this._getLayerStyle(type);

    layerStyle.renderOnCanvas({ canvas, style });
  }
});
