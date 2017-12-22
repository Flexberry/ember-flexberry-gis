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
    Flag: indicates whether to show layer name or not.

    @property showLayerName
    @type Boolean
    @default false
  */
  showLayerName: true,

  _getSimpleStyleSrc (simple) {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 24;

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
    // TODO: Implement client-side legends rendering for WFS-layers & extend.
    
    console.log(this.get('layerSettings.styleSettings'));

    let legends = Ember.A();

    let styleSettings = this.get('layerSettings.styleSettings');
    if (styleSettings.type === 'graduated' || styleSettings.type === 'unique' ) {
      styleSettings.style.categories.forEach((simple) => {
        /*var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 24;

        this.get('_layersStylesRenderer').renderOnCanvas({
          canvas: canvas,
          styleSettings: simple.styleSettings,
          target: 'legend'
        });

        var src = canvas.toDataURL(); */
        var src = this._getSimpleStyleSrc(simple);
        legends.pushObject({
          src: src,
          showLayerName: true,
          layerName: simple.name
        });
      });
    } else {
      /*this.get('_layersStylesRenderer').renderOnCanvas({
        canvas: canvas,
        styleSettings: styleSettings,
        target: 'legend'
      });*/

      var src = this._getSimpleStyleSrc(styleSettings);
      legends.pushObject({
        src: src
      });
    }

    return legends;
  })
});
