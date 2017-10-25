/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base-layer';

const { assert } = Ember;

/**
  BaseVectorLayer component for other flexberry-gis vector(geojson, kml, etc.) layers.

  @class BaseVectorLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({

  /**
    Leaflet layer group or feature group object created by model settings.

    @property _vectorLayerGroup
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @default null
    @private
  */
  _vectorLayerGroup: null,

  /**
    Fill opacity passed on initization, will be used when user change layer opacity.

    @property _initialFillOpacity
    @type Number
    @default null
    @private
   */
  _initialFillOpacity: null,

  /**
    Property flag indicates than result layer will be showed as cluster layer.

    @property clusterize
    @type Boolean
    @default false
   */
  clusterize: false,

  /**
    Property contains options for <a href="http://leaflet.github.io/Leaflet.markercluster/#options">L.markerClusterGroup</a>.

    @property clusterOptions
    @type Object
    @default null
   */
  clusterOptions: null,

  init() {
    this._super(...arguments);
  },

  /**
    Creates leaflet vector layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer() {
    assert('BaseVectorLayer\'s \'createVectorLayer\' should be overridden.');
  },

  createLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.hash({
        vectorLayer: this.createVectorLayer()
      }).then(({ vectorLayer }) => {
        this.set('_vectorLayerGroup', vectorLayer);
        let initialFillOpacity = this.get('style.fillOpacity');
        if (!Ember.isNone(initialFillOpacity)) {
          this.set('_initialFillOpacity', initialFillOpacity);
        }

        if (this.get('clusterize')) {
          var cluster = L.markerClusterGroup(this.get('clusterOptions'));
          cluster.addLayer(vectorLayer);
          resolve(cluster);
          return;
        }

        resolve(vectorLayer);
      }).catch((e) => { reject(e); });
    });
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      let bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());
      let vectorLayerGroup = this.get('_vectorLayerGroup');
      vectorLayerGroup.eachLayer(function (layer) {
        let geoLayer = layer.toGeoJSON();
        let primitive = new Terraformer.Primitive(geoLayer.geometry);
        if (primitive.within(bounds) || primitive.intersects(bounds)) {
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
      let searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';
      let vectorLayerGroup = this.get('_vectorLayerGroup');
      let features = Ember.A();

      let searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || Ember.A();

      // If single search field provided - transform it into array.
      if (!Ember.isArray(searchFields)) {
        searchFields = Ember.A([searchFields]);
      }

      vectorLayerGroup.eachLayer((layer) => {
        if (features.length < e.searchOptions.maxResultsCount) {
          let feature = Ember.get(layer, 'feature');

          // if layer satisfies search query
          let contains = false;
          searchFields.forEach((field) => {
            if (feature && (feature.properties[field])) {
              contains = contains || feature.properties[field].toLowerCase().includes(e.searchOptions.queryString.toLowerCase());
            }
          });

          if (contains) {
            let foundFeature = layer.toGeoJSON();
            foundFeature.leafletLayer = L.geoJson(foundFeature);
            features.pushObject(foundFeature);
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
  query(layerLinks, e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let queryFilter = e.queryFilter;
      let features = Ember.A();
      let equals = [];

      layerLinks.forEach((link) => {
        let linkParameters = link.get('parameters');

        if (Ember.isArray(linkParameters) && linkParameters.length > 0) {
          linkParameters.forEach(linkParam => {
            let property = linkParam.get('layerField');
            let propertyValue = queryFilter[linkParam.get('queryKey')];

            equals.push({ 'prop': property, 'value': propertyValue });
          });
        }
      });

      let vectorLayerGroup = this.get('_vectorLayerGroup');
      vectorLayerGroup.eachLayer((layer) => {
        let feature = Ember.get(layer, 'feature');
        let meet = true;
        equals.forEach((equal) => {
          meet = meet && Ember.isEqual(feature.properties[equal.prop], equal.value);
        });

        if (meet) {
          features.pushObject(layer.toGeoJSON());
        }
      });

      resolve(features);
    });
  },

  /**
    Sets leaflet layer's visibility.
    @method _setLayerOpacity
    @private
  */
  _setLayerOpacity() {
    let opacity = this.get('opacity');
    if (!Ember.isNone(opacity)) {
      let leafletLayer = this.get('_vectorLayerGroup');
      let leafletLayerStyle = Ember.get(leafletLayer, 'options.style');

      if (Ember.isNone(leafletLayerStyle)) {
        leafletLayerStyle = {};
        Ember.set(leafletLayer, 'options.style', leafletLayerStyle);
      }

      // TODO Check when style is function
      Ember.set(leafletLayerStyle, 'opacity', opacity);
      let initialFillOpacity = this.get('_initialFillOpacity');
      if (Ember.isNone(initialFillOpacity)) {
        Ember.set(leafletLayerStyle, 'fillOpacity', opacity);
      } else {
        Ember.set(leafletLayerStyle, 'fillOpacity', initialFillOpacity * opacity);
      }

      leafletLayer.setStyle(leafletLayerStyle);
    }
  }
});
