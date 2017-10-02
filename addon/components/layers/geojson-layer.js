/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';

/**
  WFS layer component for leaflet map.

  @class WfsLayerComponent
  @extend BaseLayerComponent
 */
export default BaseLayer.extend({
  leafletOptions: [
    'pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng', 'geojson'
  ],

  layerFunctions: ['pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng'],

  /**
    Sets leaflet layer's visibility.

    @method _setLayerOpacity
    @private
  */
  _setLayerOpacity() {
    let leafletLayer = this.get('_leafletObject');
    let leafletLayerStyle = Ember.get(leafletLayer, 'options.style');
    if (Ember.isNone(leafletLayerStyle)) {
      leafletLayerStyle = {};
      Ember.set(leafletLayer, 'options.style', leafletLayerStyle);
    }

    let opacity = this.get('opacity');
    Ember.set(leafletLayerStyle, 'opacity', opacity);
    Ember.set(leafletLayerStyle, 'fillOpacity', opacity);

    leafletLayer.setStyle(leafletLayerStyle);
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer(options) {
    options = Ember.$.extend(true, {}, this.get('options'), options);
    let geojson = options.geojson || {};
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
      return L.geoJSON();
    }

    let layerFunctions = this.get('layerFunctions');
    let customFunction;
    for (let i = 0; i < layerFunctions.length; i++) {
      customFunction = Ember.get(options, layerFunctions[i]);
      if (customFunction) {
        Ember.set(options, layerFunctions[i], new Function('return ' + customFunction)());
      }
    }

    return L.geoJSON(featureCollection, options);
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.

    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} polygonLayer Polygon layer related to given area.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify(e) {
    var bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());

    let geojsonLayer = this.get('_leafletObject');

    //console.log("grouplayer: "+ groupLayer);
    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      geojsonLayer.eachLayer(function(layer) {
        let geoLayer = layer.toGeoJSON();
        let primitive = new Terraformer.Primitive(geoLayer.geometry);

        if (primitive instanceof Terraformer.Point ? primitive.within(bounds) : (primitive.intersects(bounds) || primitive.within(bounds))) {
          features.pushObject(geoLayer);
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let geojLayer = this.get('_leafletObject');
      let features = Ember.A();
       geojLayer.eachLayer((layer) => {
        if (features.length < e.searchOptions.maxResultsCount) {
          let feature = Ember.get(layer, 'feature');
          let geoLayer = layer.toGeoJSON();

          // if layer satisfies search query
          let searchFields = this.get('searchSettings.searchFields'); // []
          let contains = searchFields.map((item) => {
            return feature.properties[item].toLowerCase().includes(e.searchOptions.queryString.toLowerCase());
          }).reduce((result, current) => {
            return result || current; // if any field contains
          }, false);

          if (contains) {
            features.pushObject(geoLayer);
            }
          }
        });
      resolve(features);
    });
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.

    @method _query
    @param {Object} e Event object.
    @param {Object} queryFilter Object with query filter paramteres
    @param {Object[]} results.features Array containing leaflet layers objects
    or a promise returning such array.
  */
  query(e) {

  }
});
