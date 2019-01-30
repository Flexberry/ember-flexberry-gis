import Ember from 'ember';
import BaseLegendComponent from './-private/base-legend';

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
    'layer.settingsAsObject.url',
    'layer.settingsAsObject.version',
    'layer.settingsAsObject.imageFormat',
    'layer.settingsAsObject.layers',
    'layer.settingsAsObject.legendSettings.url',
    'layer.settingsAsObject.legendSettings.version',
    'layer.settingsAsObject.legendSettings.format',
    'layer.settingsAsObject.legendSettings.layers',
    function() {
      let legends = Ember.A();
      let layerSettings = this.get('layer.settingsAsObject') || {};

      let url = Ember.get(layerSettings, 'legendSettings.url') || Ember.get(layerSettings, 'url');
      if (Ember.isBlank(url)) {
        Ember.Logger.error(
          `Unable to compute legends for '${this.get('layer.name')}' layer, because both required settings 'url' and 'legendSettings.url' are blank`
        );

        return legends;
      }

      Ember.A((Ember.get(layerSettings, 'legendSettings.layers') || Ember.get(layerSettings, 'layers') || '').split(',')).forEach((layerName) => {
        let parameters = {
          service: 'WMS',
          request: 'GetLegendGraphic',
          version: Ember.get(layerSettings, 'legendSettings.version') || Ember.get(layerSettings, 'version') || '1.1.0',
          format: Ember.get(layerSettings, 'legendSettings.format') || Ember.get(layerSettings, 'imageFormat') || 'image/png',
          layer: layerName
        };

        legends.pushObject({
          src: `${url}${L.Util.getParamString(parameters)}`,
          layerName: layerName,
          useLayerName: true
        });
      });

      return legends;
    }
  )
});
