/**
  @module ember-flexberry-gis
*/

import BaseLayer from '../base-layer';

/**
  Tile layer component for leaflet map.

  @class TileLayerComponent
  @extend BaseLayerComponent
 */
export default BaseLayer.extend({
  /**
    Tile service URL.

    @property url
    @type String
    @default null
  */
  url: null,

  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds'
  ],

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
  */
  createLayer () {
    return L.tileLayer(this.get('url'), this.get('options'));
  },

  /**
    Handles 'map:identify' event of leaflet map.

    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify(e) {
    // Tile-layers hasn't any identify logic.
  }
});
