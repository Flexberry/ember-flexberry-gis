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
  /**
    Url of tile service
    @property url
    @type String
   */
  url: null,

  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds'
  ],

  createLayer () {
    return L.tileLayer(this.get('url'), this.get('options'));
  }
});
