/**
  @module ember-flexberry-gis
*/

import WmsLayerComponent from './wms-layer';

/**
  WMS single tile layer component for leaflet map.

  @class WMSSingleTileLayerComponent
  @extends WMSLayerComponent
 */
export default WmsLayerComponent.extend({

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
  */
  createLayer() {
    let layersString = this.get('layerModel.settingsAsObject.layers');
    let layers = [];

    if (layersString) {
      layers = layersString.split('.');
    }

    let source = L.WMS.source(this.get('url'), this.get('options'));

    layers.forEach((layer) => source.addSubLayer(layer));

    return source;
  },
});
