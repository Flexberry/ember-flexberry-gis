/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';
import layout from '../../templates/components/layers/group-layer';

/**
  Group layer component for leaflet map.

  @class GroupLayerComponent
  @extends BaseLayerComponent
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
    @property _pane
    @type String
    @readOnly
  */
  _pane: Ember.computed('layerModel.id', function () {
    // to switch combine-layer
    let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
    return 'groupLayer' + this.get('layerModel.id') + layerId;
  }),

  /**
    @property _renderer
    @type Object
    @readOnly
  */
  _renderer: Ember.computed('_pane', function () {
    let pane = this.get('_pane');
    return L.canvas({ pane: pane });
  }),

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    let leafletMap = this.get('leafletMap');
    let layer = L.layerGroup();

    let thisPane = this.get('_pane');
    let pane = leafletMap.getPane(thisPane);
    if (!pane || Ember.isNone(pane)) {
      leafletMap.createPane(thisPane);
      layer.options.pane = thisPane;
      layer.options.renderer = this.get('_renderer');
    }

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
    // Group-layers hasn't any identify logic.
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
    // Group-layers hasn't any search logic.
  }
});
