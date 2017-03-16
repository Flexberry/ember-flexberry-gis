/**
  @module ember-flexberry-gis
*/

import WmsLayerComponent from './wms-layer';
import WMS from 'leaflet.wms';

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
    return WMS.source(this.get('url'), this.get('options'));
  },
});
