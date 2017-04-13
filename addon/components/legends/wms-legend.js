import Ember from 'ember';
import layout from '../../templates/components/legends/wms-legend';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('leaflet-wlegend-div').
  @property {String} flexberryClassNames.div Component's wrapping <div> CSS-class name ('leaflet-legend-image').
  @property {String} flexberryClassNames.image Component's  <img> CSS-class name ('leaflet-legend-image').
  @readonly
  @static

  @for wms-legend
*/
const flexberryClassNamesPrefix = 'leaflet-legend';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  div: flexberryClassNamesPrefix + '-div',
  image: flexberryClassNamesPrefix + '-image'
};

export default Ember.Component.extend({
  layout,
  /**
      Reference to component's CSS-classes names.
      Must be also a component's instance property to be available from component's .hbs template.
    */
  flexberryClassNames,

  /**
      Layer.

      @property layerModel
      @type Object
      @default null
    */
  layerModel: null,

  /**
      Image's format for legend's symbols.

      @property imageFormat
      @type String
      @default 'image/png'
    */
  imageFormat: 'image/png',

  /**
      Version for WMSRequest.

      @property version
      @type String
      @default '1.1.0'
    */
  version: '1.1.0',

  /**
      Array of legend's images for layer.

      @property legendImages
      @type String[]
      @readOnly
    */
  legendImages: Ember.computed('layerModel', function() {
    let legendsImageMas = [];
    let layersArr = this.get('layerModel.settingsAsObject.layers').split(',');
    let layerURL = this.get('layerModel.settingsAsObject.url');
    const service = 'WMS';
    const request = 'GetLegendGraphic';
    layersArr.forEach((item) => {
      let parameters = {
        service,
        request,
        format: this.get('imageFormat'),
        version: this.get('version'),
        layer: item
      };

      let legendsImage = layerURL + L.Util.getParamString(parameters);
      legendsImageMas.push(legendsImage);
    });

    return legendsImageMas;
  })
});
