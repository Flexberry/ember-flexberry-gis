import Ember from 'ember';
import BaseLegendComponent from '../legends/base-legend';

/**
  Component representing map layer's legend for WFS-layers.

  @class WfsLegendComponent
  @extends BaseLegendComponent
*/
export default BaseLegendComponent.extend({
  /**
    Reference to 'layers-styles-renderer' service.

    @property _layersStylesRenderer
    @type LayersStylesRendererService
    @private
  */
  _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Gets src of simple symbol.

    @method _getSimpleSymbolSrc
    @param {Object} simple Hash containing style settings.
    @private
  */
  _getSimpleSymbolSrc(simple) {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;

    this.get('_layersStylesRenderer').renderOnCanvas({
      canvas: canvas,
      styleSettings: simple,
      target: 'legend'
    });

    return canvas.toDataURL();
  },

  /**
    Array of legend's for layer.
    Every legend is an object with following structure { src: ... },
    where 'src' is legend's image source (url or base64-string).

    @property _legends
    @type Object[]
    @private
    @readOnly
  */
  _legends: Ember.computed('layerSettings.legendSettings', function() {
    let legends = Ember.A();

    let styleSettings = this.get('layerSettings.styleSettings');
    if (styleSettings.type === 'graduated' || styleSettings.type === 'unique') {
      styleSettings.style.categories.forEach((simple) => {
        let src = this._getSimpleSymbolSrc(simple.styleSettings);
        legends.pushObject({
          src: src,
          showLayerName: true,
          layerName: simple.name
        });
      });
    } else {
      let src = this._getSimpleSymbolSrc(styleSettings);
      legends.pushObject({
        src: src
      });
    }

    return legends;
  })
});
