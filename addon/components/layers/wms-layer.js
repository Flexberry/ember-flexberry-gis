/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import TileLayer from './tile-layer';

/**
  WMS layer component for leaflet map.

  @class WMSLayerComponent
  @extend TileLayerComponent
 */
export default TileLayer.extend({
  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds',
    'layers', 'styles', 'format', 'transparent', 'version', 'crs', 'info_format'
  ],

  /**
    Performs 'getFeatureInfo' request to WMS-service related to layer.

    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} latlng Identification point coordinates.
  */
  _getFeatureInfo(latlng) {
    let layer = this.get('_layer');
    let leafletMap = this.get('leafletMap');

    let point = leafletMap.latLngToContainerPoint(latlng, leafletMap.getZoom());
    let size = leafletMap.getSize();
    let crs = layer.options.crs;

    let mapBounds = leafletMap.getBounds();
    let sw = crs.project(mapBounds.getSouthWest());
    let ne = crs.project(mapBounds.getNorthEast());

    let params = {
      request: 'GetFeatureInfo',
      service: 'WMS',
      srs: crs.code,
      styles: layer.wmsParams.styles,
      transparent: layer.wmsParams.transparent,
      version: layer.wmsParams.version,
      format: layer.wmsParams.format,
      bbox: sw.x + ',' + sw.y + ',' + ne.x + ',' + ne.y,
      height: size.y,
      width: size.x,
      layers: layer.wmsParams.layers,
      query_layers: layer.wmsParams.layers,
      info_format: layer.wmsParams.info_format
    };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    let requestUrl = layer._url + L.Util.getParamString(params, layer._url, true);
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: requestUrl
      }).then((featureCollection) => {
        featureCollection = featureCollection || {};

        let features = Ember.A(Ember.get(featureCollection, 'features') || []);
        resolve(features);
      }, (reason) => {
        reason = reason || {};
        reject(reason.error || reason);
      });
    });
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
  */
  createLayer() {
    return L.tileLayer.wms(this.get('url'), this.get('options'));
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
    e.results.push({
      layer: this.get('layer'),
      features: featuresPromise
    });
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
  }
});
