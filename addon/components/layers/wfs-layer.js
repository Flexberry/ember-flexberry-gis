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
    return new L.Format[format]({ crs, geometryField });
  }),

  /**
    Performs 'getFeature' request to WFS-service related to layer.

    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
  */
  _getFeature(boundingBox) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let options = this.get('options');
      let crs = Ember.get(options, 'crs');
      let geometryField = Ember.get(options, 'geometryField');

      let layer = null;
      let destroyLayer = () => {
        if (Ember.isNone(layer)) {
          return;
        }

        layer.clearLayers();
        layer.off('load', onLayerLoad);
        layer.off('error', onLayerError);
        layer = null;
      };

      let onLayerLoad = (e) => {
        let featureCollection = e.target.toGeoJSON();
        this.injectLeafletLayersIntoGeoJSON(featureCollection);

        let features = Ember.A(Ember.get(featureCollection, 'features') || []);
        resolve(features);

        destroyLayer();
      };

      let onLayerError = (e) => {
        reject(e.error || e);

        destroyLayer();
      };

      layer = this.createLayer({
        filter: new L.Filter.BBox().append(boundingBox, geometryField, crs),
        geometryField: geometryField,
        showExisting: true
      })
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
    let featuresPromise = this._getFeature(e.boundingBox);
    e.results.push({
      layer: this.get('layer'),
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
    // TODO: implement search logic.
    e.results.features = new Ember.RSVP.Promise((resolve, reject) => {
      resolve(Ember.A());
    });
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.

    @method _query
    @param {Object} e Event object.
    @param {Object} layerLinks Array contains layer links model, use for filter searched layers
    @param {Object} queryFilter Object with query filter paramteres
    @param {Object[]} results.features Array containing leaflet layers objects
    or a promise returning such array.
  */
  query(e) {
    e.results.push(new Ember.RSVP.Promise((resolve, reject) => {
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
        resolve(e.target);

        destroyLayer();
      };

      let onLayerError = (e) => {
        reject(e.error || e);

        destroyLayer();
      };

      let filter = new L.Filter.EQ();

      for (var property in e.queryFilter) {
        if (e.queryFilter.hasOwnProperty(property)) {
          filter.append(property, e.queryFilter[property]);
        }
      }

      layer = this.createLayer({
        filter,
        showExisting: true
      }).once('load', onLayerLoad)
        .once('error', onLayerError);
    }));
  }
});
