/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';

/**
  Kml layer component for leaflet map.

  @class KmlLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({

  /**
    Reference to a created KML layer.
  */
  _kmlLayer: null,

  /**
    Specific options available on the Layer settings tab.
  */
  leafletOptions: [
    'kmlUrl',
    'kmlString'
  ],

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    let kmlUrl = this.get('kmlUrl');
    let kmlString = this.get('kmlString');
    Ember.assert('Either "kmlUrl" or "kmlString" should be defined!', Ember.isPresent(kmlUrl) || Ember.isPresent(kmlString));

    if (kmlUrl) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let layer = window.omnivore.kml(kmlUrl)
          .on('ready', (e) => {
            this.set('_kmlLayer', layer);
            resolve(layer);
          })
          .on('error', (e) => {
            reject(e.error || e);
          });
      });
    }

    if (kmlString) {
      let layer = window.omnivore.kml.parse(kmlString);
      this.set('_kmlLayer', layer);
      return layer;
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
    var bounds = new window.Terraformer.Primitive(e.polygonLayer.toGeoJSON());
    let kmlLayer = this.get('_kmlLayer');
    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      kmlLayer.eachLayer(function(layer) {
        let feature = layer.toGeoJSON();
        let primitive = new window.Terraformer.Primitive(feature.geometry);
        let l = L.geoJSON(feature);

        if (primitive instanceof window.Terraformer.Point ? primitive.within(bounds) : (primitive.intersects(bounds) || primitive.within(bounds))) {
          feature.leafletLayer = l;
          features.pushObject(feature);
        }
      });
      resolve(features);
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
    let kmlLayer = this.get('_kmlLayer');
    debugger;
    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      kmlLayer.eachLayer(function(layer) {
        let feature = layer.toGeoJSON();
        let l = L.geoJSON(feature);

        // if layer satisfies search query
        if (feature.properties.hintheader.includes(e.searchOptions.queryString)) {
          feature.leafletLayer = l;
          features.pushObject(feature);
        }
      });
      resolve(features);
    });
  }
});
