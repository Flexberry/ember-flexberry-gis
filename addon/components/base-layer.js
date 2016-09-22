/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';

const { assert } = Ember;

/**
  BaseLayer component for other flexberry-gis layers.
  @class BaseLayerComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses DynamicPropertiesMixin
  @uses LeafletOptionsMixin
  @uses LeafletPropertiesMixin
 */
export default Ember.Component.extend(
  DynamicPropertiesMixin,
  LeafletOptionsMixin,
  LeafletPropertiesMixin, {

    /**
      Leaflet layer object init by settings from model.

      @property _layer
      @type L.Layer
      @default null
      @private
     */
    _layer: undefined,

    /**
      Overload wrapper tag name for disabling wrapper.
     */
    tagName: '',

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    /**
      Leaflet container for layers.

      @property leafletContainer
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>|<a href="http://leafletjs.com/reference-1.0.0.html#layergroup">L.LayerGroup</a>
      @default null
    */
    leafletContainer: null,

    /**
      Layer metadata.

      @property layer
      @type Object
      @default null
    */
    layer: null,

    /**
      This layer index, used for layer ordering in Map.
      @property index
      @type Int
      @default null
     */
    index: null,

    /**
      Call leaflet layer setZIndex if it presents.
      @method setZIndex
     */
    setZIndex: Ember.observer('index', function () {
      let layer = this.get('_layer');
      if (layer && layer.setZIndex) {
        layer.setZIndex(this.get('index'));
      }
    }),

    /**
      Flag, indicates visible or not current layer on map.
      @property visibility
      @type Boolean
      @default null
     */
    visibility: null,

    /**
      Layer's coordinate reference system (CRS).

      @property crs
      @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
      @readOnly
    */
    crs: Ember.computed('layer.crs', 'leafletMap.options.crs', function () {
      let crs = this.get('layer.crs');
      if (Ember.isNone(crs)) {
        crs = this.get('leafletMap.options.crs');
      }

      return crs;
    }),

    /**
      Handles 'map:identify' event of leaflet map.

      @method _identify
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
      representing bounding box within which layer's objects must be identified.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
      @param {Object[]} layers Objects describing those layers which must be identified.
      @param {Object[]} results Objects describing identification results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to identification result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
      @private
    */
    _identify(e) {
      let shouldIdentify = Ember.A(e.layers || []).contains(this.get('layer'));
      if (!shouldIdentify) {
        return;
      }

      // Call public identify method, if layer should be identified.
      this.identify(e);
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this.set('_layer', this.createLayer());
      this._addObservers();
    },

    /**
      Initializes DOM-related component's properties.
    */
    didInsertElement() {
      this._super(...arguments);
      this.visibilityDidChange();
      this.setZIndex();

      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {
        // Attach custom event-handler.
        leafletMap.on('flexberry-map:identify', this._identify, this);
      }
    },

    /**
      Deinitializes DOM-related component's properties.
    */
    willDestroyElement() {
      this._super(...arguments);

      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {
        // Detach custom event-handler.
        leafletMap.off('flexberry-map:identify', this._identify, this);
      }

      let leafletContainer = this.get('leafletContainer');
      if (!Ember.isNone(leafletContainer)) {
        leafletContainer.removeLayer(this.get('_layer'));
      }
    },

    /**
      Handles changes in {{#crossLink "BaseLayerComponent/visibility:property"}}'visibility' property{{/crossLink}}.
      Switches layer's visibility.

      @method visibilityDidChange
     */
    visibilityDidChange: Ember.observer('visibility', function () {
      let container = this.get('leafletContainer');

      if (this.get('visibility')) {
        container.addLayer(this.get('_layer'));
      } else {
        container.removeLayer(this.get('_layer'));
      }
    }),

    /**
      Creates leaflet layer related to layer type.

      @method createLayer
    */
    createLayer() {
      assert('BaseLayer\'s \'createLayer\' should be overridden.');
    },

    /**
      Identifies layer's objects inside specified bounding box.

      @method identify
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
      representing bounding box within which layer's objects must be identified.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
      @param {Object[]} layers Objects describing those layers which must be identified.
      @param {Object[]} results Objects describing identification results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to identification result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    identify(e) {
      assert('BaseLayer\'s \'identify\' method should be overridden.');
    }
  }
);
