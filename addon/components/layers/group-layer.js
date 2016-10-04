/**
  @module ember-flexberry-gis
*/

import BaseLayer from '../base-layer';
import layout from '../../templates/components/layers/group-layer';

/**
  Group layer component for leaflet map.

  @class GroupLayerComponent
  @extend BaseLayerComponent
*/
export default BaseLayer.extend({
  layout,

  /**
    Sets z-index for layer.
  */
  setZIndex() {
    // Should not call setZIndex for layer, such as L.LayerGroup.setZIndex set passed index for each child layer.
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
  */
  createLayer() {
    return L.layerGroup();
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
    // Group-layers hasn't any identify logic.
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of search area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which must be searched.
    @param {Object[]} results Objects describing search results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to search result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    // Group-layers hasn't any search logic.
  }
});
