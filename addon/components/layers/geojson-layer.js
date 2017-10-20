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
    'pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng', 'geojson'
  ],

  layerFunctions: ['pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng'],

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    options = Ember.assign({}, this.get('options'), options);
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

    let geojsLayer = L.geoJSON(featureCollection, options);
    return geojsLayer;
  }
});
