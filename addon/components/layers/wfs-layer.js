/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from '../base-vector-layer';
import { checkMapZoom } from '../../utils/check-zoom';
import { intersectionArea } from '../../utils/feature-with-area-intersect';
import jsts from 'npm:jsts';
import isUUID from 'ember-flexberry-data/utils/is-uuid';
import state from '../../utils/state';
import moment from 'moment';
import { getDateFormatFromString, createTimeInterval } from '../../utils/get-date-from-string';
import getBooleanFromString from '../../utils/get-boolean-from-string';

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
    'continueLoading',
    'wpsUrl'
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
  _getFeature(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      options = Ember.$.extend(options || {}, { showExisting: true });

      let filter = Ember.get(options, 'filter');
      if (typeof filter === 'string') {
        filter = Ember.getOwner(this).lookup('layer:wfs').parseFilter(filter);
      }

      filter = this.addCustomFilter(filter);

      let resultingFilter = filter ? filter.toGml() : null;

      let wfsLayer = this.get('_leafletObject');

      let maxFeatures = Ember.get(options, 'maxFeatures');

      Ember.set(Ember.get(wfsLayer, 'options'), 'maxFeatures', maxFeatures ? maxFeatures : 1000);

      if (Ember.isNone(wfsLayer)) {
        resolve(Ember.A());
        return;
      }

      let load = this.get('_loadFeatures').bind(wfsLayer);
      load(resultingFilter, false, wfsLayer).then((layers) => {
        let features = Ember.A();

        layers.forEach((layer) => {
          let feature = layer.feature;
          feature.leafletLayer = layer;
          Ember.set(feature, 'arch', this.get('hasTime') || false);
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
  _getAttributesOptions(source) {
    return this._super(...arguments).then((attribitesOptions) => {
      Ember.set(attribitesOptions, 'settings.readonly', this.get('readonly') || false);

      return attribitesOptions;
    });
  },

  _addLayersOnMap(layers, leafletObject) {
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

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

      if (!Ember.isNone(leafletObject)) {
        leafletObject.baseAddLayer(layer);
      }

    });

    this._super(...arguments);
  },

  _addLayer(layer) {
    // не добавляем слой, пока не пройдет promise загрузки
  },

  _removeLayer(layer) {
    let leafletObject = this.get('_leafletObject');
    leafletObject.baseRemoveLayer(layer);

    if (this.get('labelSettings.signMapObjects') && leafletObject.additionalZoomLabel) {
      if (!Ember.isNone(layer._labelAdditional) && leafletObject.additionalZoomLabel) {
        leafletObject.additionalZoomLabel.forEach(zoomLabels => {
          let labelAdditional = layer._labelAdditional.filter(label => { return label.zoomCheck === zoomLabels.check; });
          if (labelAdditional.length !== 0) {
            L.FeatureGroup.prototype.removeLayer.call(zoomLabels, labelAdditional[0]);
            delete layer._labelAdditional;
          }
        });
      }
    }

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
      !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
    }
  },

  _editLayer(layer) {
    let leafletObject = this.get('_leafletObject');
    leafletObject.baseEditLayer(layer);

    if (layer.state = state.update) {
      let coordinates = this._getGeometry(layer);
      Ember.set(layer, 'feature.geometry.coordinates', coordinates);
    }

    // Changes label when edit layer feature
    this.updateLabel(layer);
  },

  /**
    Update label's layer
  */
  updateLabel(layer) {
    let leafletObject = this.get('_leafletObject');

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
      !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
      layer._label = null;
      if (!Ember.isNone(layer._labelAdditional) && leafletObject.additionalZoomLabel) {
        leafletObject.additionalZoomLabel.forEach(zoomLabels => {
          let labelAdditional = layer._labelAdditional.filter(label => { return label.zoomCheck === zoomLabels.check; });
          if (labelAdditional.length !== 0) {
            let id = layer._labelAdditional.indexOf(labelAdditional[0]);
            L.FeatureGroup.prototype.removeLayer.call(zoomLabels, labelAdditional[0]);
            delete layer._labelAdditional[id];
          }
        });
      }

      this._createStringLabel([layer], leafletObject._labelsLayer, leafletObject.additionalZoomLabel);
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      var that = this;
      if (that.error) {
        resolve([]);
        return that;
      }

      filter = this.addCustomFilter(filter);
      L.Util.request({
        url: this.options.url,
        data: L.XmlUtil.serializeXmlDocumentString(that.getFeature(filter)),
        headers: this.options.headers || {},
        withCredentials: this.options.withCredentials,
        success: function (responseText) {
          // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
          // and such situation must be handled.
          var exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
          if (exceptionReport) {
            that.fire('error', {
              error: new Error(exceptionReport.message)
            });
            reject(exceptionReport);
            return that;
          }

          // Request was truly successful (without exception report),
          // so convert response to layers.
          var layers = that.readFormat.responseToLayers(responseText, {
            coordsToLatLng: that.options.coordsToLatLng,
            pointToLayer: that.options.pointToLayer
          });

          layers.forEach(function (element) {
            if (!Ember.isNone(Ember.get(element, 'feature')) && Ember.isNone(Ember.get(element, 'feature.leafletLayer'))) {
              element.minZoom = that.minZoom;
              element.maxZoom = that.maxZoom;
              Ember.set(element.feature, 'leafletLayer', element);
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
              responseText: responseText,
              layers: layers
            });
          }

          resolve(layers);

          return that;
        },
        error: function (errorMessage) {
          that.fire('error', {
            error: new Error(errorMessage)
          });

          reject(errorMessage);

          return that;
        }
      });
    });
  },

  /**
    Removes all the layers from the group.

    @method _clearLayers
  */
  _clearLayers() {
    let leafletObject = this.get('_leafletObject');
    leafletObject.eachLayer((layer) => {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
    });

    if (this.get('labelSettings.signMapObjects') && leafletObject.additionalZoomLabel) {
      leafletObject.additionalZoomLabel.forEach(zoomLabels => {
        zoomLabels.eachLayer(layer => {
          L.FeatureGroup.prototype.removeLayer.call(zoomLabels, layer);
        });
      });
    }

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
      !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
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
      L.wfst(options, featuresReadFormat)
        .once('load', (e) => {
          let wfsLayer = e.target;
          let layer = this._createVectorLayer(wfsLayer, options, featuresReadFormat);
          resolve(layer);
        })
        .once('error', (e) => {
          console.error(e.error || e);
          let layer = this._createVectorLayer(null, options, featuresReadFormat);
          resolve(layer);
        })
        .on('load', (e) => {
          this._setLayerState();
        });
    });
  },

  _createVectorLayer(wfsLayer, options, featuresReadFormat) {
    let error = false;
    if (Ember.isNone(wfsLayer)) {
      wfsLayer = L.wfst(options, featuresReadFormat);
      error = true;
    }

    wfsLayer.error = error;
    let pkField = this.getPkField(this.get('layerModel'));
    wfsLayer.readFormat.excludedProperties = [pkField];
    let leafletMap = this.get('leafletMap');

    wfsLayer.on('save:success', this._setLayerState, this);
    wfsLayer.on('save:success', this.saveSuccess, this);
    Ember.set(wfsLayer, 'baseAddLayer', wfsLayer.addLayer);
    wfsLayer.addLayer = this.get('_addLayer').bind(this);

    Ember.set(wfsLayer, 'baseRemoveLayer', wfsLayer.removeLayer);
    wfsLayer.removeLayer = this.get('_removeLayer').bind(this);
    Ember.set(wfsLayer, 'baseClearLayers', wfsLayer.clearLayers);
    wfsLayer.clearLayers = this.get('_clearLayers').bind(this);
    Ember.set(wfsLayer, 'baseEditLayer', wfsLayer.editLayer);
    wfsLayer.editLayer = this.get('_editLayer').bind(this);

    wfsLayer.reload = this.get('reload').bind(this);
    wfsLayer.cancelEdit = this.get('cancelEdit').bind(this);
    wfsLayer.updateLabel = this.get('updateLabel').bind(this);
    wfsLayer.addCustomFilter = this.get('addCustomFilter').bind(this);

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
    this.set('loadedBounds', null);
    this._setFeaturesProcessCallback(wfsLayer);
    wfsLayer.loadFeatures = this.get('_loadFeatures').bind(wfsLayer);

    if (!error) {
      // this.get('_leafletObject') is null at this moment. _layers hasn't pane and renderer. For marker layer this is critical (ignore zoom), but for polygon layer doesn't.
      let featureLayers = Object.values(wfsLayer._layers);
      this._addLayersOnMap(featureLayers);
      let load = this.continueLoad(wfsLayer);
      if (options.showExisting) {
        let loaded = {
          layers: featureLayers
        };
        let promise = this._featuresProcessCallback(loaded.layers, wfsLayer);
        if (loaded.results && Ember.isArray(loaded.results)) {
          loaded.results.push(promise);
        }
      }

      wfsLayer.promiseLoadLayer = load && load instanceof Ember.RSVP.Promise ? load : Ember.RSVP.resolve();
    }

    wfsLayer.loadLayerFeatures = this.get('loadLayerFeatures').bind(this);
    return wfsLayer;
  },

  saveSuccess() {
    let leafletObject = this.get('_leafletObject');

    let changes = Object.values(leafletObject.changes);
    changes.forEach((layer) => {
      if (layer.state === state.insert) {
        if (leafletObject.leafletMap.hasLayer(layer._label)) {
          leafletObject.leafletMap.removeLayer(layer._label);
          let id = leafletObject.getLayerId(layer._label);
          delete leafletObject._labelsLayer[id];
        }

        if (!Ember.isNone(layer._labelAdditional) && leafletObject.additionalZoomLabel) {
          leafletObject.additionalZoomLabel.forEach(zoomLabels => {
            let labelAdditional = layer._labelAdditional.filter(label => { return label.zoomCheck === zoomLabels.check; });
            if (labelAdditional.length > 0 && leafletObject.leafletMap.hasLayer(labelAdditional[0])) {
              leafletObject.leafletMap.removeLayer(labelAdditional[0]);
              let id = zoomLabels.getLayerId(labelAdditional[0]);
              delete zoomLabels[id];
            }
          });
        }
      }
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
          let scale = this.get('mapApi').getFromApi('precisionScale');
          filteredFeatures.forEach(feature => {
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
      if (!Ember.isBlank(fieldsType) && !Ember.isBlank(e.searchOptions.queryString)) {
        searchFields.forEach((field) => {
          e.searchOptions.queryString = e.searchOptions.queryString.trim();
          let typeField = fieldsType[field];
          if (!Ember.isBlank(typeField)) {
            if (field === 'primarykey') {
              if (isUUID(e.searchOptions.queryString)) {
                equals.push(new L.Filter.EQ(field, e.searchOptions.queryString));
              }

              return;
            }

            switch (typeField) {
              case 'decimal':
              case 'number':
                let searchValue = e.searchOptions.queryString ? e.searchOptions.queryString.replace(',', '.') : e.searchOptions.queryString;
                if (!isNaN(Number(searchValue))) {
                  equals.push(new L.Filter.EQ(field, searchValue, false));
                } else {
                  if (!e.context) {
                    console.error(`Failed to convert \"${e.searchOptions.queryString}\" to numeric type`);
                  }
                }

                break;
              case 'date':
                let dateInfo = getDateFormatFromString(e.searchOptions.queryString);
                let searchDate = moment.utc(e.searchOptions.queryString, dateInfo.dateFormat + dateInfo.timeFormat, true);

                if (dateInfo.dateFormat && searchDate.isValid()) {
                  let [startInterval, endInterval] = createTimeInterval(searchDate, dateInfo.dateFormat);

                  if (endInterval) {
                    let startIntervalCondition = new L.Filter.GEQ(field, startInterval, false);
                    let endIntervalCondition = new L.Filter.LT(field, endInterval, false);
                    equals.push(new L.Filter.And(startIntervalCondition, endIntervalCondition));
                  } else {
                    equals.push(new L.Filter.EQ(field, startInterval, false));
                  }
                } else {
                  if (!e.context) {
                    console.error(`Failed to convert \"${e.searchOptions.queryString}\" to date type`);
                  }
                }

                break;
              case 'boolean':
                let booleanValue = getBooleanFromString(e.searchOptions.queryString);

                if (typeof booleanValue === 'boolean') {
                  equals.push(new L.Filter.EQ(field, booleanValue, false));
                } else {
                  if (!e.context) {
                    console.error(`Failed to convert \"${e.searchOptions.queryString}\" to boolean type`);
                  }
                }

                break;
              default:
                equals.push(new L.Filter.Like(field, '*' + e.searchOptions.queryString + '*', { matchCase: false }));
                break;
            }

          } else {
            console.error(`The field name: \"${field}\" is incorrect, check the name of the search attribute in the layer settings`);
          }
        });
      }
    }

    let filter;
    if (equals.length === 0) {
      return Ember.RSVP.resolve(Ember.A());
    } else if (equals.length === 1) {
      filter = equals[0];
    } else {
      filter = new L.Filter.Or(...equals);
    }

    let featuresPromise = this._getFeature({
      filter,
      maxFeatures: e.searchOptions.maxResultsCount + 1,
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
            filter = this.addCustomFilter(makeFilterEqOr(remainingFeat));
          } else { // If objects is already loaded, return leafletObject
            resolve(leafletObject);
            return;
          }
        } else {// load objects that don't exist yet
          let alreadyLoaded = getLoadedFeatures(null);
          let filterEqOr = makeFilterEqOr(alreadyLoaded);
          if (!Ember.isNone(filterEqOr)) {
            filter = this.addCustomFilter(new L.Filter.Not(makeFilterEqOr(alreadyLoaded)));
          }
        }

        leafletObject.loadFeatures(filter).then(() => {
          resolve(leafletObject);
        }).catch(mes => reject(mes));
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
          filter = this.addCustomFilter(filter);
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

            layers.forEach(function (element) {
              if (!Ember.isNone(Ember.get(element, 'feature')) && Ember.isNone(Ember.get(element, 'feature.leafletLayer'))) {
                Ember.set(element.feature, 'leafletLayer', element);
              }
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

    if (!leafletObject || !(leafletObject instanceof L.FeatureGroup)) {
      leafletObject = this.get('_leafletObject');
    }

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletObject)) {
      let show = this.get('visibility') || (!Ember.isNone(leafletObject.showLayerObjects) && leafletObject.showLayerObjects);
      let continueLoad = !leafletObject.options.showExisting && leafletObject.options.continueLoading;
      let showExisting = leafletObject.options.showExisting && !leafletObject.options.continueLoading;

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
        filter = this.addCustomFilter(filter);

        leafletObject.loadFeatures(filter);
        needPromise = true;
      } else if (showExisting && Ember.isEmpty(Object.values(leafletObject._layers))) {
        leafletObject.loadFeatures(this.addCustomFilter(null));
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
    Adds a listener function to leafletMap.

    @method onLeafletMapEvent
    @return nothing.
  */
  onLeafletMapEvent() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('moveend', this.continueLoad, this);
      leafletMap.on('flexberry-map:moveend', this._continueLoad, this);
    }
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
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
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
    let leafletObject = this.get('_leafletObject');
    let editTools = leafletObject.leafletMap.editTools;

    let featuresIds = [];
    Object.values(leafletObject.changes)
      .filter((layer) => { return Ember.isNone(ids) || ids.contains(leafletObject.getLayerId(layer)); }).forEach(layer => {
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

    if (!Ember.isNone(ids)) {
      ids.forEach((id) => {
        delete leafletObject.changes[id];
      });
    } else {
      leafletObject.changes = {};
    }

    if (Ember.isNone(ids) || ids.length === 0) {
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let featuresIds = this.clearChanges(ids);
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
  },

  /**
    Create body of request gs:Nearest for WPS.

    @method getWPSgsNearest
    @param {String} point Coordinates of point in EWKT.
    @return {String} Xml for request gs:Nearest.
  */
  getWPSgsNearest(point) {
    let leafletObject = this.get('_leafletObject');
    let typeNS = leafletObject.options.typeNS;
    let typeName = leafletObject.options.typeName;
    let crsName = L.CRS.EPSG4326.code;
    return '<?xml version="1.0" encoding="UTF-8"?>' +
      '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" ' +
      'xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" ' +
      'xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' +
      '<ows:Identifier>gs:Nearest</ows:Identifier>' +
      '<wps:DataInputs>' +
      '<wps:Input>' +
      '<ows:Identifier>features</ows:Identifier>' +
      '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' +
      '<wps:Body>' +
      '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2">' +
      '<wfs:Query typeName="' + typeNS + ':' + typeName + '"/>' +
      '</wfs:GetFeature>' +
      '</wps:Body>' +
      '</wps:Reference>' +
      '</wps:Input>' +
      '<wps:Input>' +
      '<ows:Identifier>point</ows:Identifier>' +
      '<wps:Data>' +
      '<wps:ComplexData mimeType="text/xml; subtype=gml/3.1.1"><![CDATA[' + point + ']]></wps:ComplexData>' +
      '</wps:Data>' +
      '</wps:Input>' +
      '<wps:Input>' +
      '<ows:Identifier>crs</ows:Identifier>' +
      '<wps:Data>' +
      '<wps:LiteralData>' + crsName + '</wps:LiteralData>' +
      '</wps:Data>' +
      '</wps:Input>' +
      '</wps:DataInputs>' +
      '<wps:ResponseForm>' +
      '<wps:RawDataOutput mimeType="application/json">' +
      '<ows:Identifier>result</ows:Identifier>' +
      '</wps:RawDataOutput>' +
      '</wps:ResponseForm>' +
      '</wps:Execute>';
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let geometryField = this.get('geometryField');
      let crs = this.get('crs');
      let filter = new L.Filter.DWithin(geometryField, featureLayer, crs, distance, 'meter');
      if (exceptFeature) {
        let layerModel = this.get('layerModel');
        let fieldName = this.getPkField(layerModel);
        const id = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layerModel, featureLayer);
        filter = new L.Filter.And(filter, new L.Filter.NotEQ(fieldName, id));
      }

      let filterPromise = this._getFeature({
        filter
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.dwithin(featureLayer, distances[iter], exceptFeature)
        .then((res) => {
          if (Ember.isArray(res) && res.length > 0) {
            resolve(res);
          } else if (iter++ < distances.length) {
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let result = null;
      let mapApi = this.get('mapApi').getFromApi('mapModel');
      let leafletObject = this.get('_leafletObject');
      let layerModel = this.get('layerModel');
      let wpsUrl = leafletObject.options.wpsUrl;
      if (!Ember.isNone(wpsUrl)) {
        let point = L.marker(mapApi.getObjectCenter(e.featureLayer)).toEWKT(L.CRS.EPSG4326).replace('SRID=4326;', '');
        let data = this.getWPSgsNearest(point);
        let _this = this;
        Ember.$.ajax({
          url: `${wpsUrl}?`,
          type: 'POST',
          contentType: 'text/xml',
          data: data,
          headers: leafletObject.options.headers || {},
          withCredentials: leafletObject.options.withCredentials,
          success: function (responseText) {
            // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
            // and such situation must be handled.
            let exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
            if (exceptionReport) {
              return reject(exceptionReport.message);
            }

            let nearObject = leafletObject.readFormat.responseToLayers(responseText, {
              coordsToLatLng: leafletObject.options.coordsToLatLng,
              pointToLayer: leafletObject.options.pointToLayer
            });
            if (Ember.isArray(nearObject) && nearObject.length === 1) {
              const distance = mapApi._getDistanceBetweenObjects(e.featureLayer, nearObject[0]);
              const id = mapApi._getLayerFeatureId(layerModel, nearObject[0]).replace(leafletObject.options.typeName + '.', '');
              let obj = {
                featureIds: [id]
              };
              _this.getLayerFeatures(obj).then((object) => {
                if (Ember.isArray(object) && object.length === 1) {
                  result = {
                    distance: distance,
                    layer: layerModel,
                    object: object[0],
                  };
                  resolve(result);
                } else {
                  reject(`Don't loaded feature with id: ${id} for layer ${layerModel.get('name')}`);
                }
              });
            } else {
              resolve('Nearest object not found');
            }
          },
          error: function (error) {
            reject(`Error for request getNearObject via WPS ${wpsUrl} for layer ${layerModel.get('name')}: ${error}`);
          }
        });
      } else {
        let distances = [1, 10, 100, 1000, 10000, 100000, 1000000];
        let layerId = layerModel.get('id');
        let exceptFeature = layerId === e.layerObjectId;
        this.upDistance(e.featureLayer, distances, 0, exceptFeature)
          .then((resultDwithin) => {
            if (!Ember.isNone(resultDwithin)) {
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
  }
});
