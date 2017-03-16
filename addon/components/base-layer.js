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

      @property _leafletObject
      @type L.Layer
      @default null
      @private
     */
    _leafletObject: undefined,

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

      @property layerModel
      @type Object
      @default null
    */
    layerModel: null,

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
      let layer = this.get('_leafletObject');
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
    crs: Ember.computed('layerModel.crs', 'leafletMap.options.crs', function () {
      let crs = this.get('layerModel.crs');
      if (Ember.isNone(crs)) {
        crs = this.get('leafletMap.options.crs');
      }

      return crs;
    }),

    /**
      Handles 'flexberry-map:identify' event of leaflet map.

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
      let shouldIdentify = Ember.A(e.layers || []).contains(this.get('layerModel'));
      if (!shouldIdentify) {
        return;
      }

      // Call public identify method, if layer should be identified.
      this.identify(e);
    },

    /**
      Handles 'flexberry-map:search' event of leaflet map.

      @method search
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
      @param {Object[]} layerModel Object describing layer that must be searched.
      @param {Object} searchOptions Search options related to layer type.
      @param {Object} results Hash containing search results.
      @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    _search(e) {
      let shouldSearch = typeof (e.filter) === 'function' && e.filter(this.get('layerModel'));
      if (!shouldSearch) {
        return;
      }

      // Call public search method, if layer should be searched.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.search(e)
      });
    },

    /**
      Handles 'flexberry-map:query' event of leaflet map.

      @method _query
      @param {Object} e Event object.
      @param {Object} layerLinks Array contains layer links model, use for filter searched layers
      @param {Object} queryFilter Object with query filter paramteres
      @param {Object[]} results.features Array containing leaflet layers objects
      or a promise returning such array.
    */
    _query(e) {
      let layerId = this.get('layerModel.id').toString();
      let layerLinks = e.layerLinks.filter(link => link.get('layerModel.id').toString() === layerId);

      if (!layerLinks.length) {
        return;
      }

      // Call public query method
      this.query(e);
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);
      this.set('_leafletObject', this.createLayer());
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
        leafletMap.on('flexberry-map:search', this._search, this);
        leafletMap.on('flexberry-map:query', this._query, this);
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
        leafletMap.off('flexberry-map:search', this._search, this);
        leafletMap.off('flexberry-map:query', this._query, this);
      }

      let leafletContainer = this.get('leafletContainer');
      if (!Ember.isNone(leafletContainer)) {
        leafletContainer.removeLayer(this.get('_leafletObject'));
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
        container.addLayer(this.get('_leafletObject'));
      } else {
        container.removeLayer(this.get('_leafletObject'));
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
      assert('BaseLayer\'s \'search\' method should be overridden.');
    },

    /**
      Handles 'flexberry-map:query' event of leaflet map.

      @method _query
      @param {Object} e Event object.
      @param {Object} layerLinks Array contains layer links model, use for filter searched layers
      @param {Object} queryFilter Object with query filter paramteres
      @param {Object[]} results.features Array containing leaflet layers objects
      or a promise returning such array.
    */
    query(e) {
      assert('BaseLayer\'s \'query\' method should be overridden.');
    },

    /**
      Injects (leafelt GeoJSON layers)[http://leafletjs.com/reference-1.0.0.html#geojson] according to current CRS
      into specified (GeoJSON)[http://geojson.org/geojson-spec] feature, features, or featureCollection

      @method injectLeafletLayersIntoGeoJSON
      @param {Object} geojson (GeoJSON)[http://geojson.org/geojson-spec] feature, features, or featureCollection.
      @param {Object} [options] Options of (leafelt GeoJSON layer)[http://leafletjs.com/reference-1.0.0.html#geojson].
      @return (leafelt GeoJSON layer)[http://leafletjs.com/reference-1.0.0.html#geojson].
    */
    injectLeafletLayersIntoGeoJSON(geojson, options) {
      geojson = geojson || {};
      options = options || {};

      let featureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      if (Ember.isArray(geojson)) {
        Ember.set(featureCollection, 'features', geojson);
      } else if (Ember.get(geojson, 'type') === 'Feature') {
        Ember.set(featureCollection, 'features', [geojson]);
      } else if (Ember.get(geojson, 'type') === 'FeatureCollection') {
        featureCollection = geojson;
      }

      let features = Ember.A(Ember.get(featureCollection, 'features') || []);
      if (Ember.get(features, 'length') === 0) {
        return null;
      }

      let crs = this.get('crs');
      Ember.set(options, 'coordsToLatLng', function (coords) {
        let point = new L.Point(coords[0], coords[1]);
        let latlng = crs.projection.unproject(point);
        if (!Ember.isNone(coords[2])) {
          latlng.alt = coords[2];
        }

        return latlng;
      });

      // Define callback method on each feature.
      let originalOnEachFeature = Ember.get(options, 'onEachFeature');
      Ember.set(options, 'onEachFeature', function (feature, leafletLayer) {
        // Remember layer inside feature object.
        Ember.set(feature, 'leafletLayer', leafletLayer);

        // Call user-defined 'onEachFeature' callback.
        if (Ember.typeOf(originalOnEachFeature) === 'function') {
          originalOnEachFeature(feature, leafletLayer);
        }
      });

      // Perform conversion & injection.
      return new L.GeoJSON(featureCollection, options);
    }
  }
);
