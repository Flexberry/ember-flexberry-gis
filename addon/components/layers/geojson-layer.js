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
  /**
    Array containing component's properties which are also leaflet layer options.

    @property leafletOptions
    @type Stirng[]
  */
  leafletOptions: [
    'pointToLayer',
    'onEachFeature',
    'filter',
    'coordsToLatLng',
    'geojson',
    'crs',
    'style'
  ],

  /**
    Array containing component's properties which are also leaflet layer callbacks.

    @property layerFunctions
    @type Stirng[]
  */
  layerFunctions: ['pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng'],

  /**
    Hash containing default implementations for leaflet layer callbacks.

    @property defaultLayerFunctions
    @type Object
  */
  defaultLayerFunctions: {
    coordsToLatLng: function(coords) {
      let crs = this.get('crs');
      let point = new L.Point(coords[0], coords[1]);
      let latlng = crs.projection.unproject(point);
      if (!Ember.isNone(coords[2])) {
        latlng.alt = coords[2];
      }

      return latlng;
    }
  },

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
    options = Ember.$.extend(true, {}, this.get('options'), options);

    let layerFunctions = this.get('layerFunctions');
    for (let i = 0; i < layerFunctions.length; i++) {
      let functionName = layerFunctions[i];

      let customFunction = Ember.get(options, functionName);
      customFunction = typeof (customFunction) === 'string' && !Ember.isBlank(customFunction) ? new Function('return ' + customFunction)() : null;

      let resultingFunction;
      if (typeof customFunction === 'function') {
        resultingFunction = customFunction;
      } else {
        let defaultFunction = this.get(`defaultLayerFunctions.${functionName}`);
        resultingFunction = typeof defaultFunction === 'function' ? defaultFunction.bind(this) : null;
      }

      if (typeof resultingFunction === 'function') {
        Ember.set(options, functionName, resultingFunction);
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
            if (typeof (response) === 'string') {
              response = JSON.parse(response);
            }

            resolve(L.geoJson(response, options));
          },
          error: function (error) {
            reject(error);
          }
        });
      });
    }

    let geojson = options.geojson || {};
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

    return L.geoJSON(featureCollection, options);
  }
});
