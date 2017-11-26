/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import WmsLayerComponent from './wms-layer';
import WfsLayerComponent from './wfs-layer';

/**
  WMS-WFS layer component for leaflet map.

  @class WmsWfsLayerComponent
  @extends WmsLayerComponent
*/
export default WmsLayerComponent.extend({
  /**
    Inner WFS layer.
    Needed for identification (always invisible, won't be added to map).

    @property _wfsLayer
  */
  _wfsLayer: null,

  /**
    Returns promise with the properties object of inner wfs layer.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    let options = Ember.$.extend(this.get('_wfsLayer.options') || {}, { showExisting: true });
    let innerLayer = this.get('_wfsLayer').createVectorLayer(options);
    return Ember.RSVP.hash({
      object: innerLayer,
      settings: {
        readonly: this.get('wfs.readonly'),
        localizedProperties: this.get('displaySettings.featuresPropertiesSettings.localizedProperties')
      }
    });
  },

  /**
    Sets wfs layer's filter, when wms filter was changed.
  */
  filterObserver: Ember.on('init', Ember.observer('options.filter', function() {
    let filter = this.get('options.filter');
    this.set('_wfsLayer.options.filter', filter);
  })),

  /**
    Returns leaflet layer for filter component.

    @method getLeafletObjectForFilter
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  getLeafletObjectForFilter() {
    let options = Ember.$.extend(this.get('_wfsLayer.options') || {}, { showExisting: true });
    return this.get('_wfsLayer').createVectorLayer(options).then(layer => {
      return layer;
    });
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
    let innerWfsLayer = this.get('_wfsLayer');
    if (!Ember.isNone(innerWfsLayer)) {
      return innerWfsLayer.identify.apply(innerWfsLayer, arguments);
    }
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.

    @method _query
    @param {Object[]} layerLinks Array containing metadata for query
    @param {Object} e Event object.
    @param {Object} queryFilter Object with query filter paramteres
    @param {Object[]} results.features Array containing leaflet layers objects
    or a promise returning such array.
  */
  query(layerLinks, e) {
    let innerWfsLayer = this.get('_wfsLayer');
    if (!Ember.isNone(innerWfsLayer)) {
      return innerWfsLayer.query.apply(innerWfsLayer, arguments);
    }
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
    let innerWfsLayer = this.get('_wfsLayer');
    if (!Ember.isNone(innerWfsLayer)) {
      return innerWfsLayer.search.apply(innerWfsLayer, arguments);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let innerWfsLayerProperties = {
      leafletMap: this.get('leafletMap'),
      leafletContainer: this.get('leafletContainer'),
      layerModel: this.get('layerModel'),
      index: this.get('index'),
      visibility: false,
      dynamicProperties: this.get('wfs')
    };

    // Set creating component's owner to avoid possible lookup exceptions.
    let owner = Ember.getOwner(this);
    let ownerKey = null;
    Ember.A(Object.keys(this) || []).forEach((key) => {
      if (this[key] === owner) {
        ownerKey = key;
        return false;
      }
    });
    if (!Ember.isBlank(ownerKey)) {
      innerWfsLayerProperties[ownerKey] = owner;
    }

    // Create inner WFS-layer which is needed for identification (always invisible, won't be added to map).
    this.set('_wfsLayer', WfsLayerComponent.create(innerWfsLayerProperties));
  },

  /**
    Destroys component.
  */
  willDestroyElement() {
    this._super(...arguments);

    let innerWfsLayer = this.get('_wfsLayer');
    if (!Ember.isNone(innerWfsLayer)) {
      innerWfsLayer.destroy();
      this.set('_wfsLayer', null);
    }
  }
});
