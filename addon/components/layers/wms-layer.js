/**
  @module ember-flexberry-gis
 */

import TileLayer from 'ember-flexberry-gis/components/layers/tile-layer';

/**
  WMSLayerComponent for leaflet map.
  @class WMSLayerComponent
  @extend TileLayerComponent
 */
export default TileLayer.extend({

  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds',
    'layers', 'styles', 'format', 'transparent', 'version', 'crs'
  ],

  createLayer() {
    return L.tileLayer.wms(...this.get('requiredOptions'), this.get('options'));
  }
});
