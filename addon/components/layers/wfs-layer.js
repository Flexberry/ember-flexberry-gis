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
    'url',
    'version',
    'namespaceUri',
    'typeNS',
    'typeName',
    'typeNSName',
    'geometryField',
    'crs',
    'maxFeatures',
    'showExisting',
    'style'
  ],

  /**
    Features read format.
    Server responses format will rely on it.

    @property featuresReadFormat
    @type {Object}
  */
  featuresReadFormat: Ember.computed('format', 'options.crs', 'options.geometryField', function () {
    let format = this.get('format');
    let availableFormats = Ember.A(Object.keys(L.Format) || []).filter((format) => {
      format = format.toLowerCase();
      return format !== 'base' && format !== 'scheme';
    });
    availableFormats = Ember.A(availableFormats);
    Ember.assert(
      `Wrong value of \`format\` property: ${format}. ` +
      `Allowed values are: [\`${availableFormats.join(`\`, \``)}\`].`,
      availableFormats.contains(format));

    let options = this.get('options');
    let crs = Ember.get(options, 'crs');
    let geometryField = Ember.get(options, 'geometryField');
    return new L.Format[format]({
      crs,
      geometryField
    });
  }),

  /**
    Performs 'getFeature' request to WFS-service related to layer.

    @param {<a href="https://github.com/Flexberry/Leaflet-WFST#initialization-options">L.WFS initialization options</a>} options
    Options of WFS plugin layer
    @param bool single
    Result should be single layer
  */
  _getFeature(options, single = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let layer = null;
      let destroyLayer = () => {
        if (Ember.isNone(layer)) {
          return;
        }

        layer.off('load', onLayerLoad);
        layer.off('error', onLayerError);
        layer = null;
      };

      let onLayerLoad = (e) => {

        if (single) {
          resolve(e.target);
        } else {
          let features = Ember.A();

          // Instead of injectLeafletLayersIntoGeoJSON to avoid duplicate repropjection,
          // retrieve features from already projected layers & inject layers into retrieved features.
          e.target.eachLayer((layer) => {
            let feature = layer.feature;
            feature.leafletLayer = layer;
            features.pushObject(feature);
          });

          resolve(features);
        }

        destroyLayer();
      };

      let onLayerError = (e) => {
        reject(e.error || e);

        destroyLayer();
      };

      options = Ember.$.extend(options || {}, {
        showExisting: true
      });

      layer = this.createLayer(options)
        .once('load', onLayerLoad)
        .once('error', onLayerError);
    });
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
  */
  createLayer(options) {
    options = Ember.$.extend(true, {}, this.get('options'), options);
    let featuresReadFormat = this.get('featuresReadFormat');

    return L.wfs(options, featuresReadFormat);
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

    let filter = new L.Filter.Intersects().append(L.rectangle(e.boundingBox), this.get('geometryField'), this.get('crs'));

    let featuresPromise = this._getFeature({
      filter
    });

    e.results.push({
      layerModel: this.get('layerModel'),
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
    let propertyName = e.searchOptions.propertyName;

    if (Ember.isNone(propertyName)) {
      propertyName = this.get('layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.displayProperty');
    }

    if (Ember.isNone(propertyName)) {
      return;
    }

    let filter = new L.Filter.Like().append(propertyName, '*' + e.searchOptions.queryString + '*', {
      matchCase: false
    });

    return this._getFeature({
      filter,
      maxFeatures: e.searchOptions.maxResultsCount,
      style: {
        color: 'yellow'
      }
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

    let filter = new L.Filter.EQ();

    for (var property in e.queryFilter) {
      if (e.queryFilter.hasOwnProperty(property)) {
        filter.append(property, e.queryFilter[property]);
      }
    }

    e.results.push(this._getFeature({
      filter
    }, true));
  }
});
