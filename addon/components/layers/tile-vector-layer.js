import Ember from 'ember';
import { default as BaseVectorLayer, begIndex } from '../base-vector-layer';

export default BaseVectorLayer.extend({
  leafletOptions: [
    'url',
    'layerName',
    'style',
  ],

  /**
    Creates leaflet vector layer related to layer type.
    @method createVectorLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer() {
    let options = this.get('options');
    let nameLayer = options.layerName;
    let url = options.url;
    let vectorGridOptions = {
      vectorTileLayerStyles: {}
    };
    vectorGridOptions.vectorTileLayerStyles[nameLayer] = options.style;
    return L.vectorGrid.protobuf(url, vectorGridOptions);
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
    // Tile-layers hasn't any identify logic.
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
    // Tile-layers hasn't any search logic.
  },

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerZIndex() {
    const leafletLayer = this.get('_leafletObject');
    if (Ember.isNone(leafletLayer)) {
      return;
    }

    const setZIndexFunc = Ember.get(leafletLayer, 'setZIndex');
    if (Ember.typeOf(setZIndexFunc) !== 'function') {
      return;
    }

    const index = this.get('index');
    leafletLayer.setZIndex(index + begIndex);
  },

});
