/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';

/* globals Terraformer, omnivore */

/**
  Kml layer component for leaflet map.

  @class KmlLayerComponent
  @extends BaseLayerComponent
*/
export default BaseLayer.extend({
  /**
    Specific option names available on the Layer settings tab.
  */
  leafletOptions: [
    'kmlUrl',
    'kmlString',
    'style'
  ],

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
    let kmlUrl = this.get('options.kmlUrl');
    let kmlString = this.get('options.kmlString');
    Ember.assert('The option "kmlUrl" or "kmlString" should be defined!', Ember.isPresent(kmlUrl) || Ember.isPresent(kmlString));

    if (kmlUrl) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let layer = omnivore.kml(kmlUrl)
          .on('ready', (e) => {
            this.set('_leafletObject', layer);
            resolve(layer);
          })
          .on('error', (e) => {
            reject(e.error || e);
          });
      });
    }

    let layer = omnivore.kml.parse(kmlString);
    this.set('_leafletObject', layer);
    return layer;
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());
      let kmlLayer = this.get('_leafletObject');
      let features = Ember.A();
      kmlLayer.eachLayer((layer) => {
        let feature = Ember.$.extend(true, {}, Ember.get(layer, 'feature')); // return a copy so that the original will be kept after cleaning the identification results
        let primitive = new Terraformer.Primitive(feature.geometry);

        if (primitive instanceof Terraformer.Point ? primitive.within(bounds) : (primitive.intersects(bounds) || primitive.within(bounds))) {
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';
      let kmlLayer = this.get('_leafletObject');
      let features = Ember.A();

      let searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || Ember.A();

      // If single search field provided - transform it into array.
      if (!Ember.isArray(searchFields)) {
        searchFields = Ember.A([searchFields]);
      }

      kmlLayer.eachLayer((layer) => {
        if (features.length < e.searchOptions.maxResultsCount) {
          let feature = Ember.get(layer, 'feature');

          // if layer satisfies search query
          let contains = searchFields.map((item) => {
            return feature.properties[item].toLowerCase().includes(e.searchOptions.queryString.toLowerCase());
          }).reduce((result, current) => {
            return result || current; // if any field contains
          }, false);

          if (contains) {
            features.pushObject(feature);
          }
        }
      });

      resolve(features);
    });
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.
    @method _query
    @param {Object[]} layerLinks Array containing metadata for query
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

      let kmlLayer = this.get('_leafletObject');
      kmlLayer.eachLayer((layer) => {
        let feature = Ember.get(layer, 'feature');

        // if layer properties meet the conditions
        let meet = equals.map((item) => {
          return Ember.isEqual(feature.properties[item.prop], item.value);
        }).reduce((result, current) => {
          return result && current;
        }, true);

        if (meet) {
          features.pushObject(feature);
        }
      });

      resolve(features);
    });
  }
});
