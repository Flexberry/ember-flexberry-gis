import TileLayer from './tile-layer';

/**
  OSM layer component for leaflet map.

  @class OSMLayerComponent
  @extends TileLayerComponent
 */
export default TileLayer.extend({

  url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',

  noWrap: true
});
