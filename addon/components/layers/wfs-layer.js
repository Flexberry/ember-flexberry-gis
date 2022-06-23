/**
  @module ember-flexberry-gis
*/

import { isNone, isBlank, isEmpty } from '@ember/utils';

import { getOwner } from '@ember/application';
import $ from 'jquery';
import { Promise, resolve, reject } from 'rsvp';
import { get, set } from '@ember/object';
import { assert } from '@ember/debug';
import { A, isArray } from '@ember/array';
import jsts from 'npm:jsts';
import isUUID from 'ember-flexberry-data/utils/is-uuid';
import BaseVectorLayer from '../base-vector-layer';
import { checkMapZoom } from '../../utils/check-zoom';
import { intersectionArea } from '../../utils/feature-with-area-intersect';
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
  leafletOptions: null,

  /**
    Returns features read format depending on 'format', 'options.crs', 'options.geometryField'.
    Server responses format will rely on it.
    @method getFeaturesReadFormat
    @return {Object} Features read format.
  */
  getFeaturesReadFormat() {
    const format = this.get('format');
    let availableFormats = A(Object.keys(L.Format) || []).filter((_format) => {
      _format = _format.toLowerCase();
      return _format !== 'base' && _format !== 'scheme';
    });
    availableFormats = A(availableFormats);
    assert(
      `Wrong value of \`format\` property: ${format}. `
      + `Allowed values are: [\`${availableFormats.join('`, `')}\`].`,
      availableFormats.includes(format)
    );

    const options = this.get('options');
    const crs = get(options, 'crs');
    const geometryField = get(options, 'geometryField');

    const readFormatOptions = {
      crs,
      geometryField,
    };

    const pane = this.get('_pane');
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
  _getFeature(options) {
    return new Promise((resolve, reject) => {
      options = $.extend(options || {}, { showExisting: true, });

      let filter = get(options, 'filter');
      if (typeof filter === 'string') {
        filter = getOwner(this).lookup('layer:wfs').parseFilter(filter);
      }

      filter = this.addCustomFilter(filter);
      const resultingFilter = filter ? filter.toGml() : null;

      const wfsLayer = this.get('_leafletObject');

      if (isNone(wfsLayer)) {
        resolve(A());
        return;
      }

      const load = this.get('_loadFeatures').bind(wfsLayer);
      load(resultingFilter, false, wfsLayer).then((layers) => {
        const features = A();

        layers.forEach((layer) => {
          const { feature, } = layer;
          feature.leafletLayer = layer;
          set(feature, 'arch', this.get('hasTime') || false);
          features.pushObject(feature);
        });

        resolve(features);
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
    return new Promise((resolve, reject) => {
      layer.getBoundingBox(
        (boundingBox) => {
          resolve(boundingBox);
        },
        (errorThrown) => {
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
      set(attribitesOptions, 'settings.readonly', this.get('readonly') || false);

      return attribitesOptions;
    });
  },

  _addLayersOnMap(layers, leafletObject) {
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    const leafletMap = this.get('leafletMap');
    const pane = this.get('_pane');

    layers.forEach((layer) => {
      if (pane) {
        if (layer instanceof L.Marker) {
          layer.options.shadowPane = pane;
        }

        layer.options.pane = pane;
        layer.options.renderer = this.get('_renderer');
      }

      layer.leafletMap = leafletMap;

      if (!isNone(leafletObject)) {
        leafletObject.baseAddLayer(layer);
      }
    });

    this._super(...arguments);
  },

  _addLayer() {
    // не добавляем слой, пока не пройдет promise загрузки
  },

  _removeLayer(layer) {
    const leafletObject = this.get('_leafletObject');
    leafletObject.baseRemoveLayer(layer);

    if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
    }
  },

  _editLayer(layer) {
    const leafletObject = this.get('_leafletObject');
    leafletObject.baseEditLayer(layer);

    if (layer.state === state.update) {
      const coordinates = this._getGeometry(layer);
      set(layer, 'feature.geometry.coordinates', coordinates);
    }

    // Changes label when edit layer feature
    this.updateLabel(layer);
  },

  /**
    Update label's layer
  */
  updateLabel(layer) {
    const leafletObject = this.get('_leafletObject');

    if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
      layer._label = null;
      this._createStringLabel(leafletObject._labelsLayer, [layer]);
    }
  },

  /**
    Load features by filter and return promise.

    @method _loadFeatures
    @param filter {L.Filter} filter on loaded features
    @param fireLoad flag indicates needs of fire 'load' event
    @returns {RSVP.Promise}.
  */
  _loadFeatures(filter, fireLoad = true) {
    return new Promise((resolve, reject) => {
      const that = this;
      filter = this.addCustomFilter(filter);
      L.Util.request({
        url: this.options.url,
        data: L.XmlUtil.serializeXmlDocumentString(that.getFeature(filter)),
        headers: this.options.headers || {},
        withCredentials: this.options.withCredentials,
        success(responseText) {
          // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
          // and such situation must be handled.
          const exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
          if (exceptionReport) {
            that.fire('error', {
              error: new Error(exceptionReport.message),
            });
            reject(exceptionReport);
            return that;
          }

          // Request was truly successful (without exception report),
          // so convert response to layers.
          const layers = that.readFormat.responseToLayers(responseText, {
            coordsToLatLng: that.options.coordsToLatLng,
            pointToLayer: that.options.pointToLayer,
          });

          layers.forEach(function (element) {
            if (!isNone(get(element, 'feature')) && isNone(get(element, 'feature.leafletLayer'))) {
              element.minZoom = that.minZoom;
              element.maxZoom = that.maxZoom;
              set(element.feature, 'leafletLayer', element);
            }
          });

          if (typeof that.options.style === 'function') {
            layers.forEach(function (element) {
              element.state = that.state.exist;
              if (element.setStyle) {
                element.setStyle(that.options.style(element));
              }

              that.addLayer(element);
            });
          } else {
            layers.forEach(function (element) {
              element.state = that.state.exist;
              that.addLayer(element);
            });

            that.setStyle(that.options.style);
          }

          if (fireLoad) {
            that.fire('load', {
              responseText,
              layers,
            });
          }

          resolve(layers);

          return that;
        },
        error(errorMessage) {
          that.fire('error', {
            error: new Error(errorMessage),
          });

          reject(errorMessage);

          return that;
        },
      });
    });
  },

  /**
    Removes all the layers from the group.

    @method _clearLayers
  */
  _clearLayers() {
    const leafletObject = this.get('_leafletObject');
    leafletObject.eachLayer((layer) => {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
    });

    if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
      leafletObject._labelsLayer.eachLayer((layer) => {
        L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer);
      });
    }

    return leafletObject;
  },

  /**
    Creates leaflet vector layer related to layer type.
    @method createVectorLayer
    @param {Object} options Layer options.
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|
      <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    return new Promise((resolve, reject) => {
      // Retrieve possibly defined in layer's settings filter.
      const initialOptions = this.get('options') || {};
      let initialFilter = get(initialOptions, 'filter');
      if (typeof initialFilter === 'string') {
        initialFilter = getOwner(this).lookup('layer:wfs').parseFilter(initialFilter);
      }

      // Retrieve possibly defined in method options filter.
      options = options || {};
      let additionalFilter = get(options, 'filter');
      if (typeof additionalFilter === 'string') {
        additionalFilter = getOwner(this).lookup('layer:wfs').parseFilter(additionalFilter);
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
      options = $.extend(true, {}, initialOptions, options, { filter: resultingFilter, });

      const featuresReadFormat = this.getFeaturesReadFormat();
      L.wfst(options, featuresReadFormat)
        .once('load', (e) => {
          const wfsLayer = e.target;
          const leafletMap = this.get('leafletMap');

          wfsLayer.on('save:success', this._setLayerState, this);
          wfsLayer.on('save:success', this.saveSuccess, this);
          set(wfsLayer, 'baseAddLayer', wfsLayer.addLayer);
          wfsLayer.addLayer = this.get('_addLayer').bind(this);

          set(wfsLayer, 'baseRemoveLayer', wfsLayer.removeLayer);
          wfsLayer.removeLayer = this.get('_removeLayer').bind(this);
          set(wfsLayer, 'baseClearLayers', wfsLayer.clearLayers);
          wfsLayer.clearLayers = this.get('_clearLayers').bind(this);
          set(wfsLayer, 'baseEditLayer', wfsLayer.editLayer);
          wfsLayer.editLayer = this.get('_editLayer').bind(this);

          wfsLayer.reload = this.get('reload').bind(this);
          wfsLayer.cancelEdit = this.get('cancelEdit').bind(this);
          wfsLayer.updateLabel = this.get('updateLabel').bind(this);
          wfsLayer.addCustomFilter = this.get('addCustomFilter').bind(this);

          if (!isNone(leafletMap)) {
            const thisPane = this.get('_pane');
            const pane = leafletMap.getPane(thisPane);
            if (!pane || isNone(pane)) {
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
          this.set('loadedBounds', null);
          this._setFeaturesProcessCallback(wfsLayer);
          wfsLayer.loadFeatures = this.get('_loadFeatures').bind(wfsLayer);

          // this.get('_leafletObject') is null at this moment. _layers hasn't pane and renderer.
          // For marker layer this is critical (ignore zoom), but for polygon layer doesn't.
          const featureLayers = Object.values(wfsLayer._layers);
          this._addLayersOnMap(featureLayers);
          const load = this.continueLoad(wfsLayer);
          if (options.showExisting) {
            const loaded = {
              layers: featureLayers,
            };
            const promise = this._featuresProcessCallback(loaded.layers, wfsLayer);
            if (loaded.results && isArray(loaded.results)) {
              loaded.results.push(promise);
            }
          }

          wfsLayer.promiseLoadLayer = load && load instanceof Promise ? load : resolve();
          wfsLayer.loadLayerFeatures = this.get('loadLayerFeatures').bind(this);

          resolve(wfsLayer);
        })
        .once('error', (e) => {
          reject(e.error || e);
        })
        .on('load', () => {
          this._setLayerState();
        });
    });
  },

  saveSuccess() {
    const leafletObject = this.get('_leafletObject');

    const changes = Object.values(leafletObject.changes);
    changes.forEach((layer) => {
      if (layer.state === state.insert) {
        if (leafletObject.leafletMap.hasLayer(layer._label)) {
          leafletObject.leafletMap.removeLayer(layer._label);
          const id = leafletObject.getLayerId(layer._label);
          delete leafletObject._labelsLayer[id];
        }
      }
    });
  },

  /**
    Creates leaflet layer related to layer type.
    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|
      <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
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
    return new Promise((resolve, reject) => {
      const filter = new L.Filter.Intersects(this.get('geometryField'), e.polygonLayer, this.get('crs'));

      this._getFeature({
        filter,
      }).then((filteredFeatures) => {
        if (this.get('typeGeometry') === 'polygon') {
          const projectedIdentifyPolygon = e.polygonLayer.toProjectedGeoJSON(this.get('crs'));
          const scale = this.get('mapApi').getFromApi('precisionScale');
          filteredFeatures.forEach((feature) => {
            feature.properties = feature.properties || {};
            feature.properties.intersectionArea = intersectionArea(projectedIdentifyPolygon, feature.leafletLayer.toProjectedGeoJSON(this.get('crs')), scale);
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
    const searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';

    // If exact field is specified in search options - use it only.
    const { propertyName, } = e.searchOptions;
    if (!isBlank(propertyName)) {
      searchFields = propertyName;
    } else {
      searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || A();
    }

    // If single search field provided - transform it into array.
    if (!isArray(searchFields)) {
      searchFields = A([searchFields]);
    }

    // Create filter for each search field.
    const equals = A();
    const leafletObject = this.get('_leafletObject');
    if (!isNone(leafletObject)) {
      const fieldsType = get(leafletObject, 'readFormat.featureType.fieldTypes');
      if (!isBlank(fieldsType)) {
        searchFields.forEach((field) => {
          const typeField = fieldsType[field];
          if (!isBlank(typeField)) {
            let accessProperty = false;
            if (field !== 'primarykey') {
              switch (typeField) {
                case 'number':
                  accessProperty = !e.context && !Number.isNaN(Number(e.searchOptions.queryString));
                  break;
                case 'date':
                  accessProperty = !e.context && new Date(e.searchOptions.queryString).toString() !== 'Invalid Date';
                  break;
                case 'boolean':
                  accessProperty = !e.context && Boolean(e.searchOptions.queryString);
                  break;
                default:
                  equals.push(new L.Filter.Like(field, `*${e.searchOptions.queryString}*`, {
                    matchCase: false,
                  }));
                  break;
              }

              if (accessProperty && typeField !== 'string') {
                equals.push(new L.Filter.EQ(field, e.searchOptions.queryString));
              }
            } else if (isUUID(e.searchOptions.queryString)) {
              equals.push(new L.Filter.EQ(field, e.searchOptions.queryString));
            }
          }
        });
      }
    }

    let filter;
    if (equals.length === 1) {
      [filter] = equals;
    } else {
      filter = new L.Filter.Or(...equals);
    }

    const featuresPromise = this._getFeature({
      filter,
      maxFeatures: e.searchOptions.maxResultsCount,
      fillOpacity: 0.3,
      style: {
        color: 'yellow',
        weight: 2,
      },
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
    const { queryFilter, } = e;
    const linkEquals = A();

    layerLinks.forEach((link) => {
      const parameters = link.get('parameters');
      if (isArray(parameters) && parameters.length > 0) {
        const equals = this.getFilterParameters(parameters, queryFilter);

        if (equals.length === 1) {
          linkEquals.pushObject(equals[0]);
        } else {
          linkEquals.pushObject(new L.Filter.And(...equals));
        }
      }
    });

    const filter = linkEquals.length === 1 ? linkEquals[0] : new L.Filter.Or(...linkEquals);

    const featuresPromise = this._getFeature({
      filter,
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
    const equals = A();

    parameters.forEach((linkParam) => {
      const property = linkParam.get('layerField');
      const propertyValue = queryFilter[linkParam.get('queryKey')];
      if (isArray(propertyValue)) {
        const propertyEquals = A();
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
    return new Promise((resolve, reject) => {
      const leafletObject = this.get('_leafletObject');
      const { featureIds, } = e;
      if (!leafletObject.options.showExisting) {
        const getLoadedFeatures = (_featureIds) => {
          const loadIds = [];
          leafletObject.eachLayer((shape) => {
            const id = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), shape);
            if (!isNone(id) && ((isArray(_featureIds) && !isNone(_featureIds) && _featureIds.indexOf(id) !== -1) || !loadIds.includes(id))) {
              loadIds.push(id);
            }
          });

          return loadIds;
        };

        const makeFilterEqOr = (loadedFeatures) => {
          if (loadedFeatures.length > 0) {
            const equals = A();
            loadedFeatures.forEach((id) => {
              const pkField = this.get('mapApi').getFromApi('mapModel')._getPkField(this.get('layerModel'));
              equals.pushObject(new L.Filter.EQ(pkField, id));
            });

            return new L.Filter.Or(...equals);
          }

          return null;
        };

        let filter = null;
        if (isArray(featureIds) && !isNone(featureIds)) { // load features by id
          const loadIds = getLoadedFeatures(featureIds);

          const remainingFeat = featureIds.filter((item) => loadIds.indexOf(item) === -1);
          if (!isEmpty(remainingFeat)) {
            filter = makeFilterEqOr(remainingFeat);
          } else { // If objects is already loaded, return leafletObject
            resolve(leafletObject);
            return;
          }
        } else { // load objects that don't exist yet
          const alreadyLoaded = getLoadedFeatures(null);
          const filterEqOr = makeFilterEqOr(alreadyLoaded);
          if (!isNone(filterEqOr)) {
            filter = new L.Filter.Not(makeFilterEqOr(alreadyLoaded));
          }
        }

        leafletObject.loadFeatures(filter).then(() => {
          resolve(leafletObject);
        }).catch((mes) => reject(mes));
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
    return new Promise((resolve, reject) => {
      const leafletObject = this.get('_leafletObject');
      const { featureIds, } = e;
      if (!leafletObject.options.showExisting) {
        let filter = null;
        if (isArray(featureIds) && !isNone(featureIds)) {
          const equals = A();
          featureIds.forEach((id) => {
            const pkField = this.get('mapApi').getFromApi('mapModel')._getPkField(this.get('layerModel'));
            equals.pushObject(new L.Filter.EQ(pkField, id));
          });

          filter = new L.Filter.Or(...equals);
          filter = this.addCustomFilter(filter);
        }

        L.Util.request({
          url: leafletObject.options.url,
          data: L.XmlUtil.serializeXmlDocumentString(leafletObject.getFeature(filter)),
          headers: leafletObject.options.headers || {},
          withCredentials: leafletObject.options.withCredentials,
          success(responseText) {
            const exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
            if (exceptionReport) {
              reject(exceptionReport.message);
            }

            const layers = leafletObject.readFormat.responseToLayers(responseText, {
              coordsToLatLng: leafletObject.options.coordsToLatLng,
              pointToLayer: leafletObject.options.pointToLayer,
            });

            layers.forEach(function (element) {
              if (!isNone(get(element, 'feature')) && isNone(get(element, 'feature.leafletLayer'))) {
                set(element.feature, 'leafletLayer', element);
              }
            });

            resolve(layers);
          },
          error(errorMessage) {
            reject(errorMessage);
          },
        });
      } else if (isArray(featureIds) && !isNone(featureIds)) {
        const objects = [];
        featureIds.forEach((id) => {
          const features = leafletObject._layers;
          const obj = Object.values(features).find((feature) => this
            .get('mapApi').getFromApi('mapModel')
            ._getLayerFeatureId(this.get('layerModel'), feature) === id);
          if (!isNone(obj)) {
            objects.push(obj);
          }
        });
        resolve(objects);
      } else {
        resolve(Object.values(leafletObject._layers));
      }
    });
  },

  /**
    Handles zoomend
  */
  continueLoad(leafletObject) {
    let loadedBounds = this.get('loadedBounds');

    if (!leafletObject || !(leafletObject instanceof L.FeatureGroup)) {
      leafletObject = this.get('_leafletObject');
    }

    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletObject)) {
      const show = this.get('visibility') || (!isNone(leafletObject.showLayerObjects) && leafletObject.showLayerObjects);
      const continueLoad = !leafletObject.options.showExisting && leafletObject.options.continueLoading;
      const showExisting = leafletObject.options.showExisting && !leafletObject.options.continueLoading;

      let needPromise = false;
      if (continueLoad && show && checkMapZoom(leafletObject)) {
        const bounds = leafletMap.getBounds();
        if (!isNone(leafletObject.showLayerObjects)) {
          leafletObject.showLayerObjects = false;
        }

        let oldPart;
        if (!isNone(loadedBounds)) {
          if (loadedBounds instanceof L.LatLngBounds) {
            loadedBounds = L.rectangle(loadedBounds);
          }

          const geojsonReader = new jsts.io.GeoJSONReader();
          const loadedBoundsJsts = geojsonReader.read(loadedBounds.toGeoJSON().geometry);
          const boundsJsts = geojsonReader.read(L.rectangle(bounds).toGeoJSON().geometry);

          if (loadedBoundsJsts.contains(boundsJsts)) {
            if (leafletObject.statusLoadLayer) {
              leafletObject.promiseLoadLayer = resolve();
            }

            return resolve('Features in bounds is already loaded');
          }

          oldPart = new L.Filter.Not(new L.Filter.Intersects(leafletObject.options.geometryField, loadedBounds, leafletObject.options.crs));

          const unionJsts = loadedBoundsJsts.union(boundsJsts);
          const geojsonWriter = new jsts.io.GeoJSONWriter();
          [loadedBounds] = L.geoJSON(geojsonWriter.write(unionJsts)).getLayers();
        } else {
          loadedBounds = bounds;
        }

        this.set('loadedBounds', loadedBounds);

        const newPart = new L.Filter.Intersects(leafletObject.options.geometryField, loadedBounds, leafletObject.options.crs);
        let filter = oldPart ? new L.Filter.And(newPart, oldPart) : newPart;
        const layerFilter = this.get('filter');
        filter = isEmpty(layerFilter) ? filter : new L.Filter.And(filter, layerFilter);

        leafletObject.loadFeatures(filter);
        needPromise = true;
      } else if (showExisting && isEmpty(Object.values(leafletObject._layers))) {
        const layerFilter = !isNone(this.get('filter')) ? this.get('filter') : null;
        leafletObject.loadFeatures(layerFilter);
        needPromise = true;
      } else if (leafletObject.statusLoadLayer) {
        leafletObject.promiseLoadLayer = resolve();
      }

      let promise;
      if (needPromise) {
        promise = new Promise((resolve, reject) => {
          leafletObject.once('loadCompleted', () => {
            resolve();
          }).once('error', () => {
            leafletObject.existingFeaturesLoaded = false;
            reject();
          });
        });
      } else {
        promise = resolve('The layer does not require loading');
      }

      if (leafletObject.statusLoadLayer) {
        leafletObject.promiseLoadLayer = promise;
      }

      return promise;
    }

    return reject('leafletObject is none');
  },

  /**
    Adds a listener function to leafletMap.

    @method onLeafletMapEvent
    @return nothing.
  */
  onLeafletMapEvent() {
    this._super(...arguments);

    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      leafletMap.on('moveend', this.continueLoad, this);
      leafletMap.on('flexberry-map:moveend', this._continueLoad, this);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this.leafletOptions = this.leafletOptions || [
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
      'continueLoading',
      'wpsUrl'
    ];
    this._super(...arguments);
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    this.onLeafletMapEvent();
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      leafletMap.off('moveend', this.continueLoad, this);
      leafletMap.off('flexberry-map:moveend', this._continueLoad, this);
    }

    this._super(...arguments);
  },

  /**
    Clear changes.

    @method clearChanges
    @param {Array} ids Array contains internal leaflet IDs for a layer.
    @return {Array} Array contains primarykey features which need load.
  */
  clearChanges(ids) {
    const leafletObject = this.get('_leafletObject');
    const { editTools, } = leafletObject.leafletMap;

    const featuresIds = [];
    Object.values(leafletObject.changes)
      .filter((layer) => isNone(ids) || ids.includes(leafletObject.getLayerId(layer))).forEach((layer) => {
        if (layer.state === state.insert) {
          if (leafletObject.hasLayer(layer)) {
            leafletObject.removeLayer(layer);
          }

          if (editTools.featuresLayer.getLayers().length !== 0) {
            const editorLayerId = editTools.featuresLayer.getLayerId(layer);
            const featureLayer = editTools.featuresLayer.getLayer(editorLayerId);
            if (!isNone(editorLayerId) && !isNone(featureLayer) && !isNone(featureLayer.editor)) {
              const { editLayer, } = featureLayer.editor;
              editTools.editLayer.removeLayer(editLayer);
              editTools.featuresLayer.removeLayer(layer);
            }
          }
        } else if (layer.state === state.update || layer.state === state.remove) {
          if (!isNone(layer.editor)) {
            const { editLayer, } = layer.editor;
            editTools.editLayer.removeLayer(editLayer);
          }

          if (leafletObject.hasLayer(layer)) {
            leafletObject.removeLayer(layer);
          }

          featuresIds.push(layer.feature.properties.primarykey);
        }
      });

    if (!isNone(ids)) {
      ids.forEach((id) => {
        delete leafletObject.changes[id];
      });
    } else {
      leafletObject.changes = {};
    }

    if (isNone(ids) || ids.length === 0) {
      editTools.editLayer.clearLayers();
    }

    return featuresIds;
  },

  /**
    Handles 'flexberry-map:cancelEdit' event of leaflet map.

    @method cancelEdit
    @param {Array} ids Array contains internal leaflet IDs for a layer.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  cancelEdit(ids) {
    return new Promise((resolve, reject) => {
      const leafletObject = this.get('_leafletObject');
      const featuresIds = this.clearChanges(ids);
      if (featuresIds.length === 0) {
        resolve();
      } else {
        const e = {
          featureIds: featuresIds,
          layer: leafletObject.layerId,
          results: A(),
        };
        this.loadLayerFeatures(e).then(() => { resolve(); }).catch(() => reject(e));
      }
    });
  },

  /**
    Create body of request gs:Nearest for WPS.

    @method getWPSgsNearest
    @param {String} point Coordinates of point in EWKT.
    @return {String} Xml for request gs:Nearest.
  */
  getWPSgsNearest(point) {
    const leafletObject = this.get('_leafletObject');
    const { typeNS, } = leafletObject.options;
    const { typeName, } = leafletObject.options;
    const crsName = L.CRS.EPSG4326.code;
    return `${'<?xml version="1.0" encoding="UTF-8"?>'
      + '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
        + 'xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" '
        + 'xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" '
        + 'xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" '
        + 'xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">'
        + '<ows:Identifier>gs:Nearest</ows:Identifier>'
        + '<wps:DataInputs>'
          + '<wps:Input>'
            + '<ows:Identifier>features</ows:Identifier>'
            + '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">'
              + '<wps:Body>'
                + '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2">'
                  + '<wfs:Query typeName="'}${typeNS}:${typeName}"/>`
                + '</wfs:GetFeature>'
              + '</wps:Body>'
            + '</wps:Reference>'
          + '</wps:Input>'
          + '<wps:Input>'
            + '<ows:Identifier>point</ows:Identifier>'
            + '<wps:Data>'
              + `<wps:ComplexData mimeType="text/xml; subtype=gml/3.1.1"><![CDATA[${point}]]></wps:ComplexData>`
            + '</wps:Data>'
          + '</wps:Input>'
          + '<wps:Input>'
            + '<ows:Identifier>crs</ows:Identifier>'
            + '<wps:Data>'
              + `<wps:LiteralData>${crsName}</wps:LiteralData>`
            + '</wps:Data>'
          + '</wps:Input>'
        + '</wps:DataInputs>'
        + '<wps:ResponseForm>'
          + '<wps:RawDataOutput mimeType="application/json">'
            + '<ows:Identifier>result</ows:Identifier>'
          + '</wps:RawDataOutput>'
        + '</wps:ResponseForm>'
      + '</wps:Execute>';
  },

  /**
    Request with filter DWithin.

    @method dwithin
    @param {Object} featureLayer Leaflet layer object.
    @param {Number} distance Distance in meter.
    @param {Boolean} exceptFeature Flag indicates that need to exclude feature,
    so that when request it in the same layer, do not get the same object.
    @return {Ember.RSVP.Promise}
  */
  dwithin(featureLayer, distance, exceptFeature) {
    return new Promise((resolve) => {
      const geometryField = this.get('geometryField');
      const crs = this.get('crs');
      let filter = new L.Filter.DWithin(geometryField, featureLayer, crs, distance, 'meter');
      if (exceptFeature) {
        const layerModel = this.get('layerModel');
        const fieldName = this.getPkField(layerModel);
        const id = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layerModel, featureLayer);
        filter = new L.Filter.And(filter, new L.Filter.NotEQ(fieldName, id));
      }

      const filterPromise = this._getFeature({
        filter,
      });
      resolve(filterPromise);
    });
  },

  /**
    Recursively calls itself increasing the distance until it gets the result.

    @method upDistance
    @param {Object} featureLayer Leaflet layer object.
    @param {Array} distances Array of distance in meter.
    @param {Number} iter Iteration number to get the distance
    @param {Boolean} exceptFeature Flag indicates that need to exclude feature,
    so that when request it in the same layer, do not get the same object (for dwithin()).
    @return {Ember.RSVP.Promise}
  */
  upDistance(featureLayer, distances, iter, exceptFeature) {
    return new Promise((resolve, reject) => {
      this.dwithin(featureLayer, distances[iter], exceptFeature)
        .then((res) => {
          if (isArray(res) && res.length > 0) {
            resolve(res);
          } else if (iter < distances.length) {
            iter += 1;
            resolve(this.upDistance(featureLayer, distances, iter, exceptFeature));
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
    Get nearest object.
    If settings of layer has wpsUrl, it do request to WPS service with request 'gs:Nearest'. It get data for request calling getWPSgsNearest().
    Response of WPS servise is FeatureCollection in json format with one feature without themselves properties of feature.
    Therefore, feature by id is loaded and distance is calculated.
    If settings of layer has not wpsUrl, it do call upDistance() for array of distances [1, 10, 100, 1000, 10000, 100000, 1000000].
    Result being processed base-vector-layer's method _calcNearestObject.

    @method getNearObject
    @param {Object} e Event object..
    @param {Object} featureLayer Leaflet layer object.
    @param {Number} featureId Leaflet layer object id.
    @param {Number} layerObjectId Leaflet layer id.
    @return {Ember.RSVP.Promise} Returns object with distance, layer model and nearest leaflet layer object.
  */
  getNearObject(e) {
    return new Promise((resolve, reject) => {
      let result = null;
      const mapApi = this.get('mapApi').getFromApi('mapModel');
      const leafletObject = this.get('_leafletObject');
      const layerModel = this.get('layerModel');
      const { wpsUrl, } = leafletObject.options;
      if (!isNone(wpsUrl)) {
        const point = L.marker(mapApi.getObjectCenter(e.featureLayer)).toEWKT(L.CRS.EPSG4326).replace('SRID=4326;', '');
        const data = this.getWPSgsNearest(point);
        const _this = this;
        $.ajax({
          url: `${wpsUrl}?`,
          type: 'POST',
          contentType: 'text/xml',
          data,
          headers: leafletObject.options.headers || {},
          withCredentials: leafletObject.options.withCredentials,
          success(responseText) {
            // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
            // and such situation must be handled.
            const exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
            if (exceptionReport) {
              return reject(exceptionReport.message);
            }

            const nearObject = leafletObject.readFormat.responseToLayers(responseText, {
              coordsToLatLng: leafletObject.options.coordsToLatLng,
              pointToLayer: leafletObject.options.pointToLayer,
            });
            if (isArray(nearObject) && nearObject.length === 1) {
              const distance = mapApi._getDistanceBetweenObjects(e.featureLayer, nearObject[0]);
              const id = mapApi._getLayerFeatureId(layerModel, nearObject[0]).replace(`${leafletObject.options.typeName}.`, '');
              const obj = {
                featureIds: [id],
              };
              _this.getLayerFeatures(obj).then((object) => {
                if (isArray(object) && object.length === 1) {
                  result = {
                    distance,
                    layer: layerModel,
                    object: object[0],
                  };
                  resolve(result);
                } else {
                  reject(new Error(`Don't loaded feature with id: ${id} for layer ${layerModel.get('name')}`));
                }
              });
            } else {
              resolve('Nearest object not found');
            }
          },
          error(error) {
            reject(new Error(`Error for request getNearObject via WPS ${wpsUrl} for layer ${layerModel.get('name')}: ${error}`));
          },
        });
      } else {
        const distances = [1, 10, 100, 1000, 10000, 100000, 1000000];
        const layerId = layerModel.get('id');
        const exceptFeature = layerId === e.layerObjectId;
        this.upDistance(e.featureLayer, distances, 0, exceptFeature)
          .then((resultDwithin) => {
            if (!isNone(resultDwithin)) {
              resolve(this._calcNearestObject(resultDwithin, e));
            } else {
              resolve('Nearest object not found');
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },
});
