/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from '../base-vector-layer';

/**
  GeoJSON layer component for leaflet map.

  @class GeoJSONLayerComponent
  @extends BaseVectorLayerComponent
 */
export default BaseVectorLayer.extend({
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
    Array containing component's properties which are also leaflet layer options callbacks.

    @property leafletOptionsCallbacks
    @type Stirng[]
  */
  leafletOptionsCallbacks: ['pointToLayer', 'style', 'onEachFeature', 'filter', 'coordsToLatLng'],

  /**
    Url for download geojson.

    @property url
    @type String
    @default null
  */
  url: null,

  /**
    Parses specified serialized callback into function.

    @method parseLeafletOptionsCallback
    @param {Object} options Method options.
    @param {String} options.callbackName Callback name.
    @param {String} options.serializedCallback Serialized callback.
    @return {Function} Deserialized callback function.
  */
  parseLeafletOptionsCallback({ callbackName, serializedCallback }) {
    // First filter must be converted into serialized function from temporary filter language.
    if (callbackName === 'filter' && typeof serializedCallback === 'string') {
      serializedCallback = Ember.getOwner(this).lookup('layer:geojson').parseFilter(serializedCallback);
    }

    return this._super({ callbackName, serializedCallback });
  },

  /**
    Creates leaflet layer related to layer type.
    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    options = Ember.$.extend(true, {}, this.get('options'), options);

    let pane = this.get('_pane');
    if (pane) {
      options.pane = pane;
      options.renderer = this.get('_renderer');
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
