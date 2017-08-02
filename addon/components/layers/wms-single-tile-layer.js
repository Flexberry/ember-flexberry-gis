/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import WmsLayerComponent from './wms-layer';
import TileLayerComponent from './tile-layer';

/**
  WMS single tile layer component for leaflet map.

  @class WMSSingleTileLayerComponent
  @extends TileLayerComponent
 */
export default TileLayerComponent.extend({
  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds',
    'layers', 'styles', 'format', 'transparent', 'version', 'crs', 'info_format', 'tiled'
  ],

  /**
    Inner WMS layer.
    Needed for identification (always invisible, won't be added to map).

    @property _wmsLayer
  */
  _wmsLayer: null,

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
    let innerWmsLayer = this.get('_wmsLayer');
    if (!Ember.isNone(innerWmsLayer)) {
      return innerWmsLayer.identify.apply(innerWmsLayer, arguments);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let innerWmsLayerProperties = {
      leafletMap: this.get('leafletMap'),
      leafletContainer: this.get('leafletContainer'),
      layerModel: this.get('layerModel'),
      index: this.get('index'),
      visibility: false,
      crs: this.get('crs'),
      url: this.get('url'),
      layers: this.get('layers'),
      info_format: this.get('info_format'),
      feature_count: this.get('feature_count')
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
      innerWmsLayerProperties[ownerKey] = owner;
    }

    // Create inner WMS-layer which is needed for identification (always invisible, won't be added to map).
    this.set('_wmsLayer', WmsLayerComponent.create(innerWmsLayerProperties));
  },

  /**
    Destroys component.
  */
  willDestroyElement() {
    this._super(...arguments);

    let innerWmsLayer = this.get('_wmsLayer');
    if (!Ember.isNone(innerWmsLayer)) {
      innerWmsLayer.destroy();
      this.set('_wmsLayer', null);
    }
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return L.WMS.overlayExtended(this.get('url'), this.get('options'));
  }
});
