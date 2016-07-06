import TileLayer from './tile';

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
