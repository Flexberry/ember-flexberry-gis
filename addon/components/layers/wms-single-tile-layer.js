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
    return L.WMS.overlayExtended(this.get('url'), this.get('options'));
  },
});
