/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-vector-layer';

/**
  GeoJSON layer component for leaflet map.

  @class GeoJSONLayerComponent
  @extend BaseVectorLayerComponent
 */
export default BaseLayer.extend({

  leafletOptions: [
    'pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng', 'geojson', 'crs'
  ],

  layerFunctions: ['pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng'],

  /**
    Url for download geojson.

    @property url
    @type String
    @default null
  */
  url: null,

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    options = Ember.$.extend({}, this.get('options'), options);
    let geojson = options.geojson || {};
    options = options || {};

    let layerFunctions = this.get('layerFunctions');
    let customFunction;
    for (let i = 0; i < layerFunctions.length; i++) {
      customFunction = Ember.get(options, layerFunctions[i]);
      if (customFunction && typeof (customFunction) === 'string') {
        Ember.set(options, layerFunctions[i], new Function('return ' + customFunction)());
      }
    }

    let url = this.get('url');
    if (!Ember.isNone(url)) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$.ajax({
          type: 'get',
          url: url,
          dataType: 'json',
          success: function (response) {
            resolve(L.geoJson(response, options));
          },
          error: function (error) {
            reject(error);
          }
        });
      });
    }

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

    let geojsLayer = L.geoJSON(featureCollection, options);
    return geojsLayer;
  }
});
