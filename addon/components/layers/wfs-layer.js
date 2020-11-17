/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from '../base-vector-layer';
import { checkMapZoom } from '../../utils/check-zoom';
import { intersectionArea } from '../../utils/feature-with-area-intersect';
import jsts from 'npm:jsts';
import state from '../../utils/state';

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

    let readFormatOptions = {
      crs,
      geometryField
    };

    let pane = this.get('_pane');
    if (pane) {
      readFormatOptions.pane = pane;
      readFormatOptions.renderer = this.get('_renderer');
    }

    return new L.Format[format](readFormatOptions);
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

  _addLayersOnMap(layers) {
    let leafletObject = this.get('_leafletObject');
    let leafletMap = this.get('leafletMap');
    let pane = this.get('_pane');

    layers.forEach((layer) => {
      if (pane) {
        if (layer instanceof L.Marker) {
          layer.options.shadowPane = pane;
        }

        layer.options.pane = pane;
        layer.options.renderer = this.get('_renderer');
      }

      layer.leafletMap = leafletMap;

      leafletObject.baseAddLayer(layer);
    });

    this._super(...arguments);
  },

  _addLayer(layer) {
    // не добавляем слой, пока не пройдет promise загрузки
  },

  _removeLayer(layer) {
    let leafletObject = this.get('_leafletObject');
    leafletObject.baseRemoveLayer(layer);

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) && !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
    }
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
          let leafletMap = this.get('leafletMap');

          wfsLayer.on('save:success', this._setLayerState, this);
          Ember.set(wfsLayer, 'baseAddLayer', wfsLayer.addLayer);
          wfsLayer.addLayer = this.get('_addLayer').bind(this);

          Ember.set(wfsLayer, 'baseRemoveLayer', wfsLayer.removeLayer);
          wfsLayer.removeLayer = this.get('_removeLayer').bind(this);

          wfsLayer.reload = this.get('reload').bind(this);

          if (!Ember.isNone(leafletMap)) {
            let thisPane = this.get('_pane');
            let pane = leafletMap.getPane(thisPane);
            if (!pane || Ember.isNone(pane)) {
              this._createPane(thisPane);
              wfsLayer.options.pane = thisPane;
              wfsLayer.options.renderer = this.get('_renderer');
              this._setLayerZIndex();
            }
          }

          // for check zoom
          wfsLayer.minZoom = this.get('minZoom');
          wfsLayer.maxZoom = this.get('maxZoom');
          wfsLayer.leafletMap = leafletMap;
          let load = this.continueLoad(wfsLayer);
          wfsLayer.promiseLoadLayer = load && load instanceof Ember.RSVP.Promise ? load : Ember.RSVP.resolve();

          resolve(wfsLayer);
        })
        .once('error', (e) => {
          reject(e.error || e);
        })
        .on('load', (e) => {
          this._setLayerState();
        });
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let filter = new L.Filter.Intersects(this.get('geometryField'), e.polygonLayer, this.get('crs'));

      this._getFeature({
        filter
      }).then(filteredFeatures => {
        if (this.get('typeGeometry') === 'polygon') {
          let projectedIdentifyPolygon = e.polygonLayer.toProjectedGeoJSON(this.get('crs'));
          filteredFeatures.forEach(feature => {
            feature.properties = feature.properties || {};
            feature.properties.intersectionArea = intersectionArea(projectedIdentifyPolygon, feature.leafletLayer.toProjectedGeoJSON(this.get('crs')));
          });
        }

        resolve(filteredFeatures);
      }).catch((message) => {
        reject(message);
      });
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
    let linkEquals = Ember.A();

    layerLinks.forEach((link) => {
      let parameters = link.get('parameters');
      if (Ember.isArray(parameters) && parameters.length > 0) {
        let equals = this.getFilterParameters(parameters, queryFilter);

        if (equals.length === 1) {
          linkEquals.pushObject(equals[0]);
        } else {
          linkEquals.pushObject(new L.Filter.And(...equals));
        }
      }
    });

    let filter = linkEquals.length === 1 ? linkEquals[0] : new L.Filter.Or(...linkEquals);

    let featuresPromise = this._getFeature({
      filter
    });

    return featuresPromise;
  },

  /**
    Get an array of link parameter restrictions.
    @method getFilterParameters
    @param {Object[]} linkParameter containing metadata for query
    @param {Object} queryFilter Object with query filter paramteres
    @returns Array of Constraints.
  */
  getFilterParameters(parameters, queryFilter) {
    let equals = Ember.A();

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

    return equals;
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
      if (!leafletObject.options.showExisting) {
        let getLoadedFeatures = (featureIds) => {
          let loadIds = [];
          leafletObject.eachLayer((shape) => {
            const id = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), shape);
            if (!Ember.isNone(id) && ((Ember.isArray(featureIds) && !Ember.isNone(featureIds) && featureIds.indexOf(id) !== -1) || !loadIds.includes(id))) {
              loadIds.push(id);
            }
          });

          return loadIds;
        };

        let makeFilterEqOr = (loadedFeatures) => {
          if (loadedFeatures.length > 0) {
            let equals = Ember.A();
            loadedFeatures.forEach((id) => {
              let pkField = this.get('mapApi').getFromApi('mapModel')._getPkField(this.get('layerModel'));
              equals.pushObject(new L.Filter.EQ(pkField, id));
            });

            return new L.Filter.Or(...equals);
          }

          return null;
        };

        let filter = null;
        if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {// load features by id
          let loadIds = getLoadedFeatures(featureIds);

          let remainingFeat = featureIds.filter((item) => {
            return loadIds.indexOf(item) === -1;
          });
          if (!Ember.isEmpty(remainingFeat)) {
            filter = makeFilterEqOr(remainingFeat);
          } else { // If objects is already loaded, return leafletObject
            resolve(leafletObject);
            return;
          }
        } else {// load objects that don't exist yet
          let alreadyLoaded = getLoadedFeatures(null);
          let filterEqOr = makeFilterEqOr(alreadyLoaded);
          if (!Ember.isNone(filterEqOr)) {
            filter = new L.Filter.Not(makeFilterEqOr(alreadyLoaded));
          }
        }

        leafletObject.loadFeatures(filter);
        leafletObject.once('load', () => {
          resolve(leafletObject);
        });
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
      if (!leafletObject.options.showExisting) {
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
    Handles zoomend
  */
  continueLoad(leafletObject) {
    let loadedBounds = this.get('loadedBounds');

    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletObject)) {
      let show = this.get('layerModel.visibility') || (!Ember.isNone(leafletObject.showLayerObjects) && leafletObject.showLayerObjects);
      let continueLoad = !leafletObject.options.showExisting && leafletObject.options.continueLoading;
      let needPromise = false;
      if (continueLoad && show && checkMapZoom(leafletObject)) {
        let bounds = leafletMap.getBounds();
        if (!Ember.isNone(leafletObject.showLayerObjects)) {
          leafletObject.showLayerObjects = false;
        }

        let oldPart;
        if (!Ember.isNone(loadedBounds)) {
          if (loadedBounds instanceof L.LatLngBounds) {
            loadedBounds = L.rectangle(loadedBounds);
          }

          let geojsonReader = new jsts.io.GeoJSONReader();
          let loadedBoundsJsts = geojsonReader.read(loadedBounds.toGeoJSON().geometry);
          let boundsJsts = geojsonReader.read(L.rectangle(bounds).toGeoJSON().geometry);

          if (loadedBoundsJsts.contains(boundsJsts)) {
            if (leafletObject.statusLoadLayer) {
              leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
            }

            return Ember.RSVP.resolve('Features in bounds is already loaded');
          }

          oldPart = new L.Filter.Not(new L.Filter.Intersects(leafletObject.options.geometryField, loadedBounds, leafletObject.options.crs));

          let unionJsts = loadedBoundsJsts.union(boundsJsts);
          let geojsonWriter = new jsts.io.GeoJSONWriter();
          loadedBounds = L.geoJSON(geojsonWriter.write(unionJsts)).getLayers()[0];
        } else {
          loadedBounds = bounds;
        }

        this.set('loadedBounds', loadedBounds);

        let newPart = new L.Filter.Intersects(leafletObject.options.geometryField, loadedBounds, leafletObject.options.crs);
        let filter = oldPart ? new L.Filter.And(newPart, oldPart) : newPart;

        leafletObject.loadFeatures(filter);
        needPromise = true;
      } else if (!leafletObject.options.showExisting && !leafletObject.options.continueLoading && show && !leafletObject.existingFeaturesLoaded) {
        leafletObject.existingFeaturesLoaded = true;
        leafletObject.loadFeatures(leafletObject.options.filter);
        needPromise = true;
      } else if (leafletObject.statusLoadLayer) {
        leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
      }

      let promise;
      if (needPromise) {
        promise = new Ember.RSVP.Promise((resolve, reject) => {
          leafletObject.once('loadCompleted', () => {
            resolve();
          }).once('error', (e) => {
            leafletObject.existingFeaturesLoaded = false;
            reject();
          });
        });
      } else {
        promise = Ember.RSVP.resolve('The layer does not require loading');
      }

      if (leafletObject.statusLoadLayer) {
        leafletObject.promiseLoadLayer = promise;
      }

      return promise;
    } else {
      return Ember.RSVP.reject('leafletObject is none');
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('moveend',  () => { this.continueLoad(); });
      leafletMap.on('flexberry-map:moveend', this._continueLoad, this);
    }
  },

  clearChanges() {
    let leafletObject = this.get('_leafletObject');
    let editTools = leafletObject.leafletMap.editTools;

    let featuresIds = [];
    Object.values(leafletObject.changes).forEach(layer => {
      if (layer.state === state.insert) {
        if (leafletObject.hasLayer(layer)) {
          leafletObject.removeLayer(layer);
        }

        if (editTools.featuresLayer.getLayers().length !== 0) {
          let editorLayerId = editTools.featuresLayer.getLayerId(layer);
          let featureLayer = editTools.featuresLayer.getLayer(editorLayerId);
          if (!Ember.isNone(editorLayerId) && !Ember.isNone(featureLayer) && !Ember.isNone(featureLayer.editor)) {
            let editLayer = featureLayer.editor.editLayer;
            editTools.editLayer.removeLayer(editLayer);
            editTools.featuresLayer.removeLayer(layer);
          }
        }
      } else if (layer.state === state.update || layer.state === state.remove) {
        if (!Ember.isNone(layer.editor)) {
          let editLayer = layer.editor.editLayer;
          editTools.editLayer.removeLayer(editLayer);
        }

        if (leafletObject.hasLayer(layer)) {
          leafletObject.removeLayer(layer);
        }

        featuresIds.push(layer.feature.properties.primarykey);
      }
    });

    leafletObject.changes = {};

    return featuresIds;
  },

  /**
    Handles 'flexberry-map:cancelEdit' event of leaflet map.

    @method cancelEdit
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  cancelEdit() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let featuresIds = this.clearChanges();
      if (featuresIds.length === 0) {
        resolve();
      } else {
        let e = {
          featureIds: featuresIds,
          layer: leafletObject.layerId,
          results: Ember.A()
        };
        this.loadLayerFeatures(e).then(() => { resolve(); }).catch((e) => reject(e));
      }
    });
  }
});
