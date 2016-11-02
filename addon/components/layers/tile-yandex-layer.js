/**
  @module ember-flexberry-gis
*/

import BaseLayer from '../base-layer';

/**
  Tile yandex layer component for leaflet map.

  @class TileYandexLayerComponent
  @extend BaseLayerComponent
 */
export default BaseLayer.extend({
  /**
    Map type.
    Possible values are: 'map', 'satellite', 'hybrid', 'publicMap', 'publicMapHybrid'.

    @property type
    @type String
    @default 'map'
  */
  type: 'map',

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
  */
  createLayer() {
    let layer = new L.Yandex(this.get('type'));

    layer.once('MapObjectInitialized', ({ mapObject }) => {
      // Disable some yandex map additional markup elements.
      mapObject.options.set('suppressMapOpenBlock', true);
      mapObject.options.set('suppressObsoleteBrowserNotifier', true);
    });

    return layer;
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.

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
    // Tile yandex layer hasn't any identify logic.
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
    @param {Object[]} layer Object describing layer that must be searched.
    @param {Object} searchOptions Search options related to layer type.
    @param {Object} results Hash containing search results.
    @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    // Tile yandex layer hasn't any search logic.
  }
});
