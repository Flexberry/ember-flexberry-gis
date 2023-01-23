import Ember from 'ember';
import DS from 'ember-data';
import BaseLegendComponent from './-private/base-legend';

/**
  Component representing map layer's legend for WMS-layers.

  @class WmsLegendComponent
  @extends BaseLegendComponent
*/
export default BaseLegendComponent.extend({
  /**
   * Flag shows that height of legend can be dynamic (for full legend)
   */
  dynamicHeight: true,

  /**
   * Default scale options (height and width) for GetLegendGraphic query (JSON)
   */
  defaultScale: 24,

  /**
   * Height for image container (dynamic)
   */
  height: 24,

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
    'layer.settingsAsObject.styles',
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

      return DS.PromiseArray.create({
        promise: Ember.RSVP.Promise.all(Ember.A((Ember.get(layerSettings, 'legendSettings.layers') || Ember.get(layerSettings, 'layers') || '').split(','))
        .map((layerName) => {
          return new Ember.RSVP.Promise((resolve) => {
            const format = Ember.get(layerSettings, 'legendSettings.format') || Ember.get(layerSettings, 'imageFormat') || 'image/png';
            let legendImageScale = this.get('defaultScale');
            let parameters = {
              service: 'WMS',
              request: 'GetLegendGraphic',
              version: Ember.get(layerSettings, 'legendSettings.version') || Ember.get(layerSettings, 'version') || '1.1.0',
              format: format,
              width: legendImageScale,
              height: legendImageScale,
              layer: layerName,
              style: Ember.get(layerSettings, 'styles') || ''
            };

            if (format !== 'application/json') {
              resolve([{
                src: `${url}${L.Util.getParamString(parameters)}`,
                layerName: layerName,
                useLayerName: false
              }]);
            } else {
              let legendUrl = `${url}${L.Util.getParamString(parameters)}`;
              Ember.$.ajax(legendUrl, {
                method: 'GET'
              })
                .fail(() => resolve(null))
                .done((response) => {
                  if (response && response.Legend && response.Legend[0]) {
                    // One legend per query.
                    let legendsContainer = [];
                    response.Legend[0].rules.forEach(rule => {
                      parameters.rule = rule.name;
                      parameters.format = 'image/png';
                      parameters.width = legendImageScale;
                      parameters.height = legendImageScale;
                      legendsContainer.push({
                        src: `${url}${L.Util.getParamString(parameters)}`,
                        layerName: rule.name,
                        useLayerName: true,
                        style: `height: ${this.get('height')}px;`
                      });
                    });
                    resolve(legendsContainer);
                  }
                });
            }
          });
        })).then(lArray => {
          legends.pushObjects(lArray.filter(l => !!l).flat());
          return legends;
        })
      });
    })
});
