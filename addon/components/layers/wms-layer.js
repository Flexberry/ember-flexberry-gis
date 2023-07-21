/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import TileLayer from './tile-layer';
import { begIndex } from '../base-vector-layer';
import ENV from 'ember-app/config/environment';

/**
  WMS layer component for leaflet map.

  @class WMSLayerComponent
  @extends TileLayerComponent
 */
export default TileLayer.extend({
  env: ENV.APP.wmsEnv,

  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds', 'filter',
    'layers', 'styles', 'format', 'transparent', 'version', 'crs', 'info_format', 'tiled'
  ],

  /**
    Performs 'getFeatureInfo' request to WMS-service related to layer.

    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} latlng Identification point coordinates.
  */
  _getFeatureInfo(latlng) {
    let layer = this.get('_leafletObject');

    if (Ember.isNone(layer)) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        reject(`Leaflet layer for '${this.get('layerModel.name')}' isn't created yet`);
      });
    }

    return new Ember.RSVP.Promise((resolve, reject) => {
      layer.getFeatureInfo({
        latlng: latlng,
        infoFormat: this.get('info_format'),
        map: this.get('leafletMap'),
        crs: this.get('crs'),
        featureCount: this.get('feature_count'),
        done(featuresCollection, xhr) {
          let features = Ember.A(Ember.get(featuresCollection, 'features') || []);
          resolve(features);
        },
        fail(errorThrown, xhr) {
          reject(errorThrown);
        }
      });
    });
  },

  /**
    Returns leaflet layer's bounding box.

    @method _getBoundingBox
    @private
    @return <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a>
  */
  _getBoundingBox(layer) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      layer.getBoundingBox({
        done(boundingBox, xhr) {
          resolve(boundingBox);
        },
        fail(errorThrown, xhr) {
          reject(errorThrown);
        }
      });
    });
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    let options = this.get('options') || {};
    let filter = Ember.get(options, 'filter');
    if (typeof filter === 'string') {
      filter = Ember.getOwner(this).lookup('layer:wms').parseFilter(filter);
    }

    if (!Ember.isBlank(filter) && filter.toGml) {
      filter = filter.toGml();
    }

    if (filter instanceof Element) {
      filter = L.XmlUtil.serializeXmlDocumentString(filter);
    }

    this.setEnv();

    options = Ember.$.extend(true, {}, options, { filter: filter, env: this.get('env') });

    return L.tileLayer.wms(this.get('url'), options);
  },

  setEnv() {
    if (this.get('env').indexOf('%time%') > 0) {
      let timzone = new Date().toTimeString().split(' ')[1].match(/[+-]\d{4}/);
      if (timzone && timzone.length > 0) {
        timzone = timzone[0];
        timzone = (timzone.substring(0, 1) === '+' ? '-' : '+') + timzone.substring(1, 3) + ':' + timzone.substring(3, 5);
        let env = this.get('env').replace('%time%', timzone);
        this.set('env', env);
      }
    }
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
    let featuresPromise = this._getFeatureInfo(e.latlng);

    return featuresPromise;
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
    // Wms-layers hasn't any search logic.
  },

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerZIndex(leafletLayer) {
    if (!leafletLayer) {
      leafletLayer = this.get('_leafletObject');
    }

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
