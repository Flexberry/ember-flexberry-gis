/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base-layer';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';

const { assert } = Ember;

/**
  BaseVectorLayer component for other flexberry-gis vector(geojson, kml, etc.) layers.

  @class BaseVectorLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({
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

  /**
    Observes and handles changes in {{#crossLink "BaseVectorLayerComponent/clusterize:property"}}'clusterize' property{{/crossLink}}.
    Resets layer with respect to new value of {{#crossLink "BaseVectorLayerComponent/clusterize:property"}}'clusterize' property{{/crossLink}}.

    @method _clusterizeDidChange
    @private
  */
  _clusterizeDidChange: Ember.observer('clusterize', function () {
    // Call to Ember.run.once is needed because some of layer's 'dynamicProperties' can be unchenged yet ('clusterize' is dynamic property),
    // but Ember.run.once guarantee that all 'dynamicProperies' will be already chaged before '_resetLayer' will be called.
    Ember.run.once(this, '_resetLayer');
  }),

  /**
    Sets leaflet layer's opacity.

    @method _setLayerOpacity
    @private
  */
  _setLayerOpacity() {
    // Layers with 'empty' layers-style always must have their opacity set to 0, so we don't change such layers opacity here.
    let layerStyleType = this.get('styleSettings.type');
    if (layerStyleType === 'empty') {
      return;
    }

    let opacity = this.get('opacity');
    if (Ember.isNone(opacity)) {
      return;
    }

    let leafletLayer = this.get('_leafletObject');
    if (Ember.isNone(leafletLayer)) {
      return;
    }

    setLeafletLayerOpacity({ leafletLayer, opacity });
  },

  /**
    Creates leaflet vector layer related to layer type.

    @method createVectorLayer
    @param {Object} options Layer options.
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    assert('BaseVectorLayer\'s \'createVectorLayer\' should be overridden.');
  },

  /**
    Clusterizes created vector layer if 'clusterize' option is enabled.

    @method createClusterLayer
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>} vectorLayer Vector layer which must be clusterized.
    @return {<a href="https://github.com/Leaflet/Leaflet.markercluster/blob/master/src/MarkerClusterGroup.js">L.MarkerClusterGroup</a>} Clusterized vector layer.
  */
  createClusterLayer(vectorLayer) {
    let clusterLayer = L.markerClusterGroup(this.get('clusterOptions'));
    clusterLayer.addLayer(vectorLayer);

    clusterLayer._featureGroup.on('layeradd', this._setLayerOpacity, this);
    clusterLayer._featureGroup.on('layerremove', this._setLayerOpacity, this);

    return clusterLayer;
  },

  /**
    Destroys clusterized leaflet layer related to layer type.

    @method destroyLayer
  */
  destroyClusterLayer(clusterLayer) {
    clusterLayer._featureGroup.off('layeradd', this._setLayerOpacity, this);
    clusterLayer._featureGroup.off('layerremove', this._setLayerOpacity, this);
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @return {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.hash({
        vectorLayer: this.createVectorLayer()
      }).then(({ vectorLayer }) => {
        if (this.get('clusterize')) {
          let clusterLayer = this.createClusterLayer(vectorLayer);
          resolve(clusterLayer);
        } else {
          resolve(vectorLayer);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Destroys leaflet layer related to layer type.

    @method destroyLayer
  */
  destroyLayer() {
    let leafletLayer = this.get('_leafletObject');
    if (leafletLayer instanceof L.MarkerClusterGroup) {
      this.destroyClusterLayer(leafletLayer);
    }
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
      let leafletLayer = this.get('_leafletObject');
      leafletLayer.eachLayer(function (layer) {
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
      let leafletLayer = this.get('_leafletObject');
      let features = Ember.A();

      let searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || Ember.A();

      // If single search field provided - transform it into array.
      if (!Ember.isArray(searchFields)) {
        searchFields = Ember.A([searchFields]);
      }

      leafletLayer.eachLayer((layer) => {
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

      let leafletLayer = this.get('_leafletObject');
      leafletLayer.eachLayer((layer) => {
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
  }
});
