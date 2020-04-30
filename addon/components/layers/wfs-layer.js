/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from '../base-vector-layer';
import { checkMapZoomLayer, checkMapZoom } from '../../utils/check-zoom';

/**
  WFS layer component for leaflet map.
  @class WfsLayerComponent
  @extends BaseVectorLayerComponent
 */
export default BaseVectorLayer.extend({
  /**
    Array containing component's properties which are also leaflet layer options.
    @property leafletOptions
    @type Stirng[]
  */
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
    'filter',
    'forceMulti',
    'withCredentials',
    'continueLoading'
  ],

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
    @param {<a href="https://github.com/Flexberry/Leaflet-WFST#initialization-options">L.WFS initialization options</a>} options WFS layer options.
    @param {Boolean} [single = false] Flag: indicates whether result should be a single layer.
  */
  _getFeature(options, single = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      options = Ember.$.extend(options || {}, { showExisting: true });
      this.createVectorLayer(options).then((wfsLayer) => {
        if (single) {
          resolve(wfsLayer);
        } else {
          let features = Ember.A();

          // Instead of injectLeafletLayersIntoGeoJSON to avoid duplicate reprojection,
          // retrieve features from already projected layers & inject layers into retrieved features.
          wfsLayer.eachLayer((layer) => {
            let feature = layer.feature;
            feature.leafletLayer = layer;
            features.pushObject(feature);
          });

          resolve(features);
        }
      }).catch((e) => {
        reject(e);
      });
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

  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    return this._super(...arguments).then((attribitesOptions) => {
      Ember.set(attribitesOptions, 'settings.readonly', this.get('readonly') || false);

      return attribitesOptions;
    });
  },

  /**
    Creates leaflet vector layer related to layer type.
    @method createVectorLayer
    @param {Object} options Layer options.
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // Retrieve possibly defined in layer's settings filter.
      let initialOptions = this.get('options') || {};
      let initialFilter = Ember.get(initialOptions, 'filter');
      if (typeof initialFilter === 'string') {
        initialFilter = Ember.getOwner(this).lookup('layer:wfs').parseFilter(initialFilter);
      }

      // Retrieve possibly defined in method options filter.
      options = options || {};
      let additionalFilter = Ember.get(options, 'filter');
      if (typeof additionalFilter === 'string') {
        additionalFilter = Ember.getOwner(this).lookup('layer:wfs').parseFilter(additionalFilter);
      }

      // Try to combine filters or choose one which is defined.
      let resultingFilter = null;
      if (initialFilter && additionalFilter) {
        resultingFilter = new L.Filter.And(initialFilter, additionalFilter).toGml();
      } else if (initialFilter) {
        resultingFilter = initialFilter.toGml();
      } else if (additionalFilter) {
        resultingFilter = additionalFilter.toGml();
      }

      // Combine options defined in layer's settings with options defined in method, and with resulting filter option.
      options = Ember.$.extend(true, {}, initialOptions, options, { filter: resultingFilter });

      let featuresReadFormat = this.getFeaturesReadFormat();
      let newLayer = L.wfst(options, featuresReadFormat)
        .once('load', (e) => {
          let wfsLayer = e.target;
          let visibility = this.get('layerModel.visibility');
          if (!options.showExisting && options.continueLoading && visibility && checkMapZoomLayer(this)) {
            let leafletMap = this.get('leafletMap');
            let bounds = leafletMap.getBounds();
            let filter = new L.Filter.BBox(options.geometryField, bounds, options.crs);
            wfsLayer.loadFeatures(filter);
            wfsLayer.isLoadBounds = bounds;
          }

          wfsLayer.on('save:success', this._setLayerState, this);
          resolve(wfsLayer);
        })
        .once('error', (e) => {
          reject(e.error || e);
        })
        .on('load', (e) => {
          this._setLayerState();
          if (e.layers && e.layers.forEach) {
            e.layers.forEach((layer) => {
              layer.minZoom = this.get('minZoom');
              layer.maxZoom = this.get('maxZoom');
            });
          }
        });

      let promiseLoad = new Ember.RSVP.Promise((resolve, reject) => {
        newLayer.once('load', () => {
          resolve();
        }).once('error', (e) => {
          reject();
        });
      });

      this.set('promiseLoad', promiseLoad);
    });
  },

  /**
    Creates leaflet layer related to layer type.
    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    // Base logic from 'base-vector-layer' 'createLayer' method is enough.
    return this._super(...arguments);
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

    return this._getFeature({
      filter
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
    let searchFields;
    let searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';

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
    let leafletObject = this.get('_leafletObject');
    if (!Ember.isNone(leafletObject)) {
      let fieldsType = Ember.get(leafletObject, 'readFormat.featureType.fieldTypes');
      if (!Ember.isBlank(fieldsType)) {
        searchFields.forEach((field) => {
          let typeField = fieldsType[field];
          if (!Ember.isBlank(typeField)) {
            if (typeField !== 'string') {
              equals.push(new L.Filter.EQ(field, e.searchOptions.queryString));
            } else {
              equals.push(new L.Filter.Like(field, '*' + e.searchOptions.queryString + '*', {
                matchCase: false
              }));
            }
          }
        });
      }
    }

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
    let equals = Ember.A();
    layerLinks.forEach((link) => {
      let parameters = link.get('parameters');

      if (Ember.isArray(parameters) && parameters.length > 0) {
        parameters.forEach(linkParam => {
          let property = linkParam.get('layerField');
          let propertyValue = queryFilter[linkParam.get('queryKey')];
          if (Ember.isArray(propertyValue)) {
            let propertyEquals = Ember.A();
            propertyValue.forEach((value) => {
              propertyEquals.pushObject(new L.Filter.EQ(property, value));
            });

            equals.pushObject(new L.Filter.Or(...propertyEquals));
          } else {
            equals.pushObject(new L.Filter.EQ(property, propertyValue));
          }
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
  },

  /**
    Handles 'flexberry-map:loadLayerFeatures' event of leaflet map.

    @method loadLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  loadLayerFeatures(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let featureIds = e.featureIds;
      if (!leafletObject.options.showExisting && leafletObject.options.continueLoading) {
        let loadIds = [];
        leafletObject.eachLayer((shape) => {
          const id = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), shape);

          if (!Ember.isNone(id) && featureIds.indexOf(id) !== -1) {
            loadIds.push(id);
          }
        });

        if (loadIds.length !== featureIds.length) {
          let remainingFeat = featureIds.filter((item) => {
            return loadIds.indexOf(item) === -1;
          });

          let filter = null;
          if (!Ember.isNone(remainingFeat)) {
            let equals = Ember.A();
            remainingFeat.forEach((id) => {
              let pkField = this.get('mapApi').getFromApi('mapModel')._getPkField(this.get('layerModel'));
              if (featureIds.includes(id)) {
                equals.pushObject(new L.Filter.EQ(pkField, id));
              }
            });

            filter = new L.Filter.Or(...equals);
          }

          leafletObject.loadFeatures(filter);
          leafletObject.once('load', () => {
            resolve(leafletObject);
          });
        } else {
          resolve(leafletObject);
        }
      } else {
        resolve(leafletObject);
      }
    });
  },

  /**
    Handles 'flexberry-map:getLayerFeatures' event of leaflet map.

    @method getLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  getLayerFeatures(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let featureIds = e.featureIds;
      if (!leafletObject.options.showExisting && leafletObject.options.continueLoading) {
        let filter = null;
        if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
          let equals = Ember.A();
          featureIds.forEach((id) => {
            let pkField = this.get('mapApi').getFromApi('mapModel')._getPkField(this.get('layerModel'));
            equals.pushObject(new L.Filter.EQ(pkField, id));
          });

          filter = new L.Filter.Or(...equals);
        }

        L.Util.request({
          url: leafletObject.options.url,
          data: L.XmlUtil.serializeXmlDocumentString(leafletObject.getFeature(filter)),
          headers: leafletObject.options.headers || {},
          withCredentials: leafletObject.options.withCredentials,
          success: function (responseText) {
            let exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
            if (exceptionReport) {
              reject(exceptionReport.message);
            }

            let layers = leafletObject.readFormat.responseToLayers(responseText, {
              coordsToLatLng: leafletObject.options.coordsToLatLng,
              pointToLayer: leafletObject.options.pointToLayer
            });

            resolve(layers);
          },
          error: function (errorMessage) {
            reject(errorMessage);
          }
        });
      } else {
        if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
          let objects = [];
          featureIds.forEach((id) => {
            let features = leafletObject._layers;
            let obj = Object.values(features).find(feature => {
              return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), feature) === id;
            });
            if (!Ember.isNone(obj)) {
              objects.push(obj);
            }
          });
          resolve(objects);
        } else {
          resolve(Object.values(leafletObject._layers));
        }
      }
    });
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      let loadedBounds = leafletMap.getBounds();
      let continueLoad = () => {
        let leafletObject = this.get('_leafletObject');
        if (!Ember.isNone(leafletObject)) {
          let show = this.get('layerModel.visibility') || (!Ember.isNone(leafletObject.showLayerObjects) && leafletObject.showLayerObjects);
          let continueLoad = !leafletObject.options.showExisting && leafletObject.options.continueLoading;
          if (continueLoad && show && checkMapZoom(leafletObject)) {
            let bounds = leafletMap.getBounds();
            if (!Ember.isNone(leafletObject.showLayerObjects)) {
              leafletObject.showLayerObjects = false;
            }

            if (Ember.isNone(leafletObject.isLoadBounds)) {
              let filter = new L.Filter.BBox(leafletObject.options.geometryField, bounds, leafletObject.options.crs);
              leafletObject.loadFeatures(filter);
              leafletObject.isLoadBounds = bounds;
              loadedBounds = bounds;
              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = new Ember.RSVP.Promise((resolve, reject) => {
                  leafletObject.once('load', () => {
                    resolve();
                  }).once('error', (e) => {
                    reject();
                  });
                });
              }

              return;
            } else if (loadedBounds.contains(bounds)) {
              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
              }

              return;
            }

            let oldRectangle = L.rectangle([loadedBounds.getSouthEast(), loadedBounds.getNorthWest()]);
            let loadedPart = new L.Filter.Not(new L.Filter.Intersects(leafletObject.options.geometryField, oldRectangle, leafletObject.options.crs));

            loadedBounds.extend(bounds);
            let newRectangle = L.rectangle([loadedBounds.getSouthEast(), loadedBounds.getNorthWest()]);
            let newPart = new L.Filter.Intersects(leafletObject.options.geometryField, newRectangle, leafletObject.options.crs);

            let filter = new L.Filter.And(newPart, loadedPart);
            leafletObject.loadFeatures(filter);

            if (leafletObject.statusLoadLayer) {
              leafletObject.promiseLoadLayer = new Ember.RSVP.Promise((resolve, reject) => {
                leafletObject.once('load', () => {
                  resolve();
                }).once('error', (e) => {
                  reject();
                });
              });
            }
          } else if (leafletObject.statusLoadLayer) {
            leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
          }
        }
      };

      leafletMap.on('moveend', continueLoad);
    }
  }
});
