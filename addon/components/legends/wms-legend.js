import Ember from 'ember';
import BaseLegendComponent from '../legends/base-legend';

/**
  Component representing map layer's legend for WMS-layers.

  @class WmsLegendComponent
  @extends BaseLegendComponent
*/
export default BaseLegendComponent.extend({
  /**
    Array of legend's for layer.
    Every legend is an object with following structure { src: ... },
    where 'src' is legend's image source (url or base64-string).

    @property _legends
    @type Object[]
    @private
    @readOnly
  */
  _legends: Ember.computed(
    'layerSettings.url',
    'layerSettings.version',
    'layerSettings.imageFormat',
    'layerSettings.layers',
    'layerSettings.legendSettings.url',
    'layerSettings.legendSettings.version',
    'layerSettings.legendSettings.format',
    'layerSettings.legendSettings.layers', function() {
    let legends = Ember.A();

    let url = this.get('layerSettings.legendSettings.url') || this.get('layerSettings.url');
    if (Ember.isBlank(url)) {
      Ember.Logger.error(`Unable to compute legends for '${this.get('name')}' layer, because both required settings 'url' and 'legendSettings.url' are blank`);
      return legends;
    }

    Ember.A((this.get('layerSettings.legendSettings.layers') || this.get('layerSettings.layers') || '').split(',')).forEach((layerName) => {
      let parameters = {
        service: 'WMS',
        request: 'GetLegendGraphic',
        version: this.get('layerSettings.legendSettings.version') || this.get('layerSettings.version') || '1.1.0',
        format: this.get('layerSettings.legendSettings.format') || this.get('layerSettings.format') || 'image/png',
        layer: layerName
      };

      legends.pushObject({
        src: `${url}${L.Util.getParamString(parameters)}`,
        layerName: layerName
      });
    });

    return legends;
  })
});
