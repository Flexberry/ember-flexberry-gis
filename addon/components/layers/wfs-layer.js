/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-layer';

/**
  WFS layer component for leaflet map.

  @class WfsLayerComponent
  @extends BaseLayerComponent
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
    'style',
    'filter'
  ],

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
    Returns features read format depending on 'format', 'options.crs', 'options.geometryField'.
    Server responses format will rely on it.

    @method getFeaturesReadFormat
    @return {Object} Features read format.
  */
  getFeaturesReadFormat() {
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
  },

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

      layer = this._createWFSLayer(options)
        .once('load', onLayerLoad)
        .once('error', onLayerError);
    });
  },

  /**
    Returns leaflet layer's bounding box.

    @method _getBoundingBox
    @private
    @return <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a>
  */
  _getBoundingBox(layer) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      layer.getBoundingBox(
        (boundingBox, xhr) => {
          resolve(boundingBox);
        },
        (errorThrown, xhr) => {
          reject(errorThrown);
        }
      );
    });
  },

  _createWFSLayer(options) {
    options = Ember.$.extend(true, {}, this.get('options'), options);
    if (options.filter && !(options.filter instanceof Element)) {
      let filter = Ember.getOwner(this).lookup('layer:wfs').parseFilter(options.filter);
      if (filter.toGml) {
        filter = filter.toGml();
      }

      options.filter = filter;
    }

    let featuresReadFormat = this.getFeaturesReadFormat();

    return L.wfst(options, featuresReadFormat);
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!this.get('clusterize')) {
        resolve(this._createWFSLayer(options));
        return;
      }

      let onLayerLoad = (e) => {
        let wfsLayer = e.target;

        let cluster = L.markerClusterGroup(this.get('clusterOptions'));
        cluster.addLayer(wfsLayer);

        // Read format contains 'DescribeFeatureType' metadata and is necessary for 'flexberry-layers-attributes-panel' component.
        cluster.readFormat = Ember.get(wfsLayer, 'readFormat');

        resolve(cluster);
      };

      let onLayerError = (e) => {
        reject(e);
      };

      this._createWFSLayer(options)
        .once('load', onLayerLoad)
        .once('error', onLayerError);
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
    let filter = new L.Filter.Intersects(this.get('geometryField'), e.polygonLayer, this.get('crs'));

    let featuresPromise = this._getFeature({
      filter
    });

    return featuresPromise;
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
    let searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';

    let searchFields;

    // If exact field is specified in search options - use it only.
    let propertyName = e.searchOptions.propertyName;
    if (!Ember.isBlank(propertyName)) {
      searchFields = propertyName;
    } else {
      searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || Ember.A();
    }

    // If single search field provided - transform it into array.
    if (!Ember.isArray(searchFields)) {
      searchFields = Ember.A([searchFields]);
    }

    // Create filter for each search field.
    let equals = Ember.A();
    searchFields.forEach((field) => {
      equals.push(new L.Filter.Like(field, '*' + e.searchOptions.queryString + '*', {
        matchCase: false
      }));
    });

    let filter;
    if (equals.length === 1) {
      filter = equals[0];
    } else {
      filter = new L.Filter.Or(...equals);
    }

    let featuresPromise = this._getFeature({
      filter,
      maxFeatures: e.searchOptions.maxResultsCount,
      fillOpacity: 0.3,
      style: {
        color: 'yellow',
        weight: 2
      }
    });

    return featuresPromise;
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
    let queryFilter = e.queryFilter;
    let equals = [];
    layerLinks.forEach((link) => {
      let parameters = link.get('parameters');

      if (Ember.isArray(parameters) && parameters.length > 0) {
        parameters.forEach(linkParam => {
          let property = linkParam.get('layerField');
          let propertyValue = queryFilter[linkParam.get('queryKey')];

          equals.push(new L.Filter.EQ(property, propertyValue));
        });
      }
    });

    let filter;
    if (equals.length === 1) {
      filter = equals[0];
    } else {
      filter = new L.Filter.And(...equals);
    }

    let featuresPromise = this._getFeature({
      filter
    });

    return featuresPromise;
  }
});
