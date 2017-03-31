import WMSLegend from '../legends/wms-legend';
import Ember from 'ember';

export default WMSLegend.extend({
  /**
      Array of legend's images for layer.

      @property legendImages
      @type String[]
      @readOnly
    */
  legendImages: Ember.computed('layer', function() {
    let legendsImageMas = [];
    let layerURL = this.get('layer.settingsAsObject.url');
    let layer = this.get('layer.settingsAsObject.typeNS') + ':' + this.get('layer.settingsAsObject.typeName');
    const service = 'WMS';
    const request = 'GetLegendGraphic';
    let parameters = {
      service,
      request,
      format: this.get('imageFormat'),
      version: this.get('version'),
      layer: layer
    };

    let legendsImage = layerURL + L.Util.getParamString(parameters);
    legendsImageMas.push(legendsImage);

    return legendsImageMas;
  })
});
