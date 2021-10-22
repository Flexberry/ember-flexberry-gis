import { isBlank } from '@ember/utils';
import { A } from '@ember/array';
import { computed, get } from '@ember/object';
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
  _legends: computed(
    'layer.settingsAsObject.url',
    'layer.settingsAsObject.version',
    'layer.settingsAsObject.imageFormat',
    'layer.settingsAsObject.layers',
    'layer.settingsAsObject.legendSettings.url',
    'layer.settingsAsObject.legendSettings.version',
    'layer.settingsAsObject.legendSettings.format',
    'layer.settingsAsObject.legendSettings.layers',
    function () {
      const legends = A();
      const layerSettings = this.get('layer.settingsAsObject') || {};

      const url = get(layerSettings, 'legendSettings.url') || get(layerSettings, 'url');
      if (isBlank(url)) {
        Ember.Logger.error(
          `Unable to compute legends for '${this.get('layer.name')}' layer, because both required settings 'url' and 'legendSettings.url' are blank`
        );

        return legends;
      }

      A((get(layerSettings, 'legendSettings.layers') || get(layerSettings, 'layers') || '').split(',')).forEach((layerName) => {
        const parameters = {
          service: 'WMS',
          request: 'GetLegendGraphic',
          version: get(layerSettings, 'legendSettings.version') || get(layerSettings, 'version') || '1.1.0',
          format: get(layerSettings, 'legendSettings.format') || get(layerSettings, 'imageFormat') || 'image/png',
          layer: layerName,
        };

        legends.pushObject({
          src: `${url}${L.Util.getParamString(parameters)}`,
          layerName,
          useLayerName: true,
        });
      });

      return legends;
    }
  ),
});
