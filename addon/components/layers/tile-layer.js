/**
  @module ember-flexberry-gis
 */


import BaseLayer from 'ember-flexberry-gis/components/base-layer';

/**
  TileLayerComponent for leaflet map.
  @class TileLayerComponent
  @extend BaseLayerComponent
 */
export default BaseLayer.extend({
  leafletRequiredOptions: [
    'url'
  ],

  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds'
  ],

  createLayer () {
    return L.tileLayer(...this.get('requiredOptions'), this.get('options'));
  }
});
