/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import { Query, Projection, Serializer } from 'ember-flexberry-data';
import { checkMapZoom } from '../../utils/check-zoom';
import state from '../../utils/state';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import GisAdapter from 'ember-flexberry-gis/adapters/odata';
import DS from 'ember-data';
import jsts from 'npm:jsts';
import { capitalize, camelize } from 'ember-flexberry-data/utils/string-functions';
import isUUID from 'ember-flexberry-data/utils/is-uuid';
import moment from 'moment';
import getBooleanFromString from '../../utils/get-boolean-from-string';
import { getDateFormatFromString, createTimeInterval } from '../../utils/get-date-from-string';

/**
  For batch reading
*/
const maxBatchFeatures = 10000;
const { Builder } = Query;
/**
  Investment layer component for leaflet map.

  @class ODataVectorLayerComponent
  @extends BaseVectorLayer
 */
export default BaseVectorLayer.extend({

  leafletOptions: [
    'attribution',
    'pane',
    'styles',
    'crs',
    'showExisting',
    'continueLoading',
    'filter',
    'forceMulti',
    'dynamicModel',
    'metadataUrl',
    'odataUrl',
    'projectionName'
  ],

  clusterize: false,

  store: Ember.inject.service(),

  postfixForEditForm: '-e',

  /**
    Saves layer changes.

    @method save
  */
  save() {
    let leafletObject = this.get('_leafletObject');
    let leafletMap = this.get('leafletMap');
    leafletObject.eachLayer(layer => {
      if (Ember.get(layer, 'model.hasDirtyAttributes')) {
        if (layer.state === state.insert) {
          let coordinates = this._getGeometry(layer);
          Ember.set(layer, 'feature.geometry.coordinates', coordinates);
        }
      }
    }, leafletObject);

    let modelsLayer = leafletObject.models;
    if (modelsLayer.length > 0) {
      let insertedIds = leafletObject.getLayers().map((layer) => {
        if (layer.state === state.insert) {
          return layer.feature.properties.primarykey;
        }
      });
      let insertedLayer = leafletObject.getLayers().filter(layer => {
        return layer.state === state.insert;
      });

      let updatedLayer = leafletObject.getLayers().filter(layer => {
        return layer.state === state.update;
      });

      // to send request via the needed adapter
      let obj = this.get('_adapterStoreModelProjectionGeom');
      obj.adapter.batchUpdate(obj.store, modelsLayer).then((models) => {
        modelsLayer.clear();
        let insertedModelId = [];
        if (!Ember.isNone(updatedLayer) && updatedLayer.length > 0) {
          updatedLayer.map((layer) => {
            layer.state = state.exist;
          });
        }

        models.forEach(model => {
          let ids = insertedIds.filter(id => {
            return Ember.isNone(model) ? false : model.get('id') === id;
          });
          if (ids.length > 0) {
            insertedModelId.push(ids[0]);
          }
        });

        insertedLayer.forEach(function (layer) {
          L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
          if (!Ember.isNone(layer._labelAdditional) && leafletObject.additionalZoomLabel) {
            leafletObject.additionalZoomLabel.forEach(zoomLabels => {
              let labelAdditional = layer._labelAdditional.filter(label => { return label.zoomCheck === zoomLabels.check; });
              if (labelAdditional.length !== 0) {
                L.FeatureGroup.prototype.removeLayer.call(zoomLabels, labelAdditional[0]);
              }
            });
          }

          if (!Ember.isNone(layer._label) && leafletMap.hasLayer(layer._label)) {
            L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
          }
        });

        if (insertedModelId.length > 0) {
          this.get('mapApi').getFromApi('mapModel')._getModelLayerFeature(this.layerModel.get('id'), insertedModelId, true, true)
            .then(([, lObject, featureLayer]) => {
              this._setLayerState();
              leafletObject.fire('save:success', { layers: featureLayer });
            });
        } else {
          leafletObject.fire('save:success', { layers: [] });
        }
      }).catch(function (e) {
        console.error('Error save: ' + e);
        leafletObject.fire('save:failed', e);
      });
    } else {
      leafletObject.fire('save:success', { layers: [] });
    }

    return leafletObject;
  },

  /**
    Trigers after layer was edited.

    @method editLayer
    @param layer
  */
  editLayer(layer) {
    let leafletObject = this.get('_leafletObject');
    if (layer.model) {
      const geometryField = this.get('geometryField') || 'geometry';
      const geometryObject = {};
      geometryObject.coordinates = this._getGeometry(layer);
      geometryObject.type = Ember.get(layer, 'feature.geometry.type');
      geometryObject.crs = {
        properties: { name: this.get('crs.code') },
        type: 'name'
      };
      Ember.set(layer, 'feature.geometry.coordinates', geometryObject.coordinates);
      layer.model.set(geometryField, geometryObject);
      if (layer.state !== state.insert) {
        layer.state = state.update;
      }

      var id = leafletObject.getLayerId(layer);
      leafletObject.models[id] = layer.model;
    }

    // Changes label when edit layer feature
    this.updateLabel(layer);

    return leafletObject;
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
    Removes all the layers from the group.

    @method clearLayers
  */
  clearLayers() {
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
    Deletes model in odata layer.

    @method removeLayer
    @param layer
  */
  removeLayer(layer) {
    let leafletObject = this.get('_leafletObject');
    L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
    var id = leafletObject.getLayerId(layer);

    if (id in leafletObject.models) {
      if (layer.state === state.insert) {
        delete leafletObject.models[id];
      } else {
        layer.model.deleteRecord();
        layer.model.set('hasChanged', true);
        layer.state = state.remove;
      }
    } else {
      layer.model.deleteRecord();
      layer.model.set('hasChanged', true);
      layer.state = state.remove;
      leafletObject.models[id] = layer.model;
    }

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

  /**
    Add layer in model.

    @method addLayer
    @param layer
  */
  addLayer(layer, leafletObject) {
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    if (!layer) {
      // явная ошибка, не должно быть такой ситуации
      return leafletObject;
    }

    if (layer.state && layer.state !== state.insert) {
      L.FeatureGroup.prototype.addLayer.call(leafletObject, layer);
      return;
    }

    const featureProperties = Ember.$.extend({ id: generateUniqueId() }, layer.feature.properties);
    const model = this.get('store').createRecord(this.get('modelName'), featureProperties);
    const geometryField = this.get('geometryField') || 'geometry';
    const geometryObject = {};
    let typeModel = this.get('geometryType');
    switch (typeModel) {
      case 'PointPropertyType':
        geometryObject.type = 'Point';
        break;
      case 'LineStringPropertyType':
        geometryObject.type = 'LineString';
        break;
      case 'PolygonPropertyType':
        geometryObject.type = 'Polygon';
        break;
      case 'MultiLineStringPropertyType':
        geometryObject.type = 'MultiLineString';
        break;
      case 'MultiPolygonPropertyType':
        geometryObject.type = 'MultiPolygon';
        break;
      default:
        throw 'Unknown type ' + typeModel;
    }

    geometryObject.coordinates = this._getGeometry(layer);
    geometryObject.crs = {
      properties: { name: this.get('crs.code') },
      type: 'name'
    };

    model.set(geometryField, geometryObject);
    model.set('id', generateUniqueId());
    layer.state = state.insert;
    this._setLayerProperties(layer, model, geometryObject);
    L.FeatureGroup.prototype.addLayer.call(leafletObject, layer);
    var id = leafletObject.getLayerId(layer);
    leafletObject.models[id] = layer.model;
    return leafletObject;
  },

  /**
    Set layer properties

    @method _setLayerProperties
    @param {Object} layer layer
    @param {Ember.Model} model feature's model
    @param {Object} geometry
  */
  _setLayerProperties(layer, model, geometry) {
    const modelProj = this.get('projectionName');
    layer.options.crs = this.get('crs');
    layer.model = model;
    layer.modelProj = modelProj;
    layer.minZoom = this.get('minZoom');
    layer.maxZoom = this.get('maxZoom');
    layer.feature = {
      type: 'Feature',
      geometry: geometry,
      leafletLayer: layer
    };

    layer.feature.properties = new Proxy(model, {
      get: function (target, prop) {
        if (prop === 'primarykey') {
          return target.get('id');
        }

        return target.get(prop);
      },
      set: function (target, prop, value) {
        if (prop === 'primarykey') {
          target.set('id', value);
        } else {
          target.set(prop, value);
        }

        return true;
      },
      ownKeys(target) {
        let modelKeys = Object.keys(target.toJSON());
        modelKeys.push('primarykey');
        return modelKeys;
      },
      getOwnPropertyDescriptor(target, name) {
        const proxy = this;
        return { get value() { return proxy.get(target, name); }, configurable: true, enumerable: true, writable: true };
      },
      has: function (target, prop) {
        return target.has(prop);
      },
    });

    layer.feature.id = this.get('modelName') + '.' + layer.feature.properties.primarykey;
    layer.leafletMap = this.get('leafletMap');

    let pane = this.get('_pane');
    if (pane) {
      if (layer instanceof L.Marker) {
        layer.options.shadowPane = pane;
      }

      layer.options.pane = pane;
      layer.options.renderer = this.get('_renderer');
    }

    if (geometry.type === 'Point') {
      layer.options.style = this.get('style');
    } else {
      layer.options.style = this.get('styleSettings.style.path');
    }
  },

  /**
    Get feature, not add to map

    @method _getFeature
    @param filter
    @param maxFeatures
    @param isIdentify
  */
  _getFeature(filter, maxFeatures, isIdentify = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let obj = this.get('_adapterStoreModelProjectionGeom');

      let queryBuilder = new Builder(obj.store)
        .from(obj.modelName)
        .selectByProjection(obj.projectionName);

      if (!Ember.isNone(maxFeatures)) {
        queryBuilder.top(maxFeatures);
      }

      filter = this.addCustomFilter(filter);
      if (!Ember.isNone(filter)) {
        queryBuilder.where(filter);
      }

      let build = queryBuilder.build();
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let intersectionArea = config.APP.intersectionArea;
      if (isIdentify && build.select.indexOf(intersectionArea) === -1) {
        build.select.push(intersectionArea);
      }

      let objs = obj.adapter.batchLoadModel(obj.modelName, build, obj.store);
      objs.then(res => {
        let features = Ember.A();
        let models = res;
        if (typeof res.toArray === 'function') {
          models = res.toArray();
        }

        let layer = L.featureGroup();

        models.forEach(model => {
          let feat = this.addLayerObject(layer, model, false);
          Ember.set(feat.feature, 'arch', this.get('hasTime') || false);
          features.push(feat.feature);
        });

        resolve(features);
      }).catch((e) => {
        reject(e.error || e);
      });
    });
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.
    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} polygonLayer Polygon layer related to given area.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
  **/
  identify(e) {
    let geometryField = this.get('geometryField') || 'geometry';
    let pred = new Query.GeometryPredicate(geometryField);
    let predicate = pred.intersects(e.polygonLayer.toEWKT(this.get('crs')));
    let featuresPromise = this._getFeature(predicate, null, true);
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
      let type = this.get('layerModel.type');
      if (!Ember.isBlank(type) && !Ember.isBlank(e.searchOptions.queryString)) {
        let store = Ember.getOwner(this).lookup('service:store');
        let modelConstructor = store.modelFor(leafletObject.modelName);
        let layerProperties = Ember.get(modelConstructor, `attributes`);
        searchFields.forEach((field) => {
          let property = layerProperties.get(field);
          e.searchOptions.queryString = e.searchOptions.queryString.trim();
          if (field === 'primarykey') {
            if (isUUID(e.searchOptions.queryString)) {
              equals.push(new Query.SimplePredicate('id', Query.FilterOperator.Eq, e.searchOptions.queryString));
            }

            return;
          }

          if (!Ember.isNone(property)) {
            switch (property.type) {
              case 'decimal':
              case 'number':
                let searchValue = e.searchOptions.queryString ? e.searchOptions.queryString.replace(',', '.') : e.searchOptions.queryString;
                if (!isNaN(Number(searchValue))) {
                  equals.push(new Query.SimplePredicate(property.name, Query.FilterOperator.Eq, searchValue));
                } else {
                  if (!e.context) {
                    console.error(`Failed to convert \"${e.searchOptions.queryString}\" to numeric type`);
                  }
                }

                break;
              case 'date':
                let dateInfo = getDateFormatFromString(e.searchOptions.queryString);
                let searchDate = moment(e.searchOptions.queryString, dateInfo.dateFormat + dateInfo.timeFormat, true);
                if (dateInfo.dateFormat && searchDate.isValid()) {
                  let [startInterval, endInterval] = createTimeInterval(searchDate, dateInfo.dateFormat);

                  if (endInterval) {
                    let startIntervalCondition = new Query.DatePredicate(property.name, Query.FilterOperator.Geq, startInterval, false);
                    let endIntervalCondition = new Query.DatePredicate(property.name, Query.FilterOperator.Le, endInterval, false);
                    equals.push(new Query.ComplexPredicate(Query.Condition.And, startIntervalCondition, endIntervalCondition));
                  } else if (dateInfo.timeFormat === 'THH:mm:ss.SSSSZ') {
                    equals.push(new Query.DatePredicate(property.name, Query.FilterOperator.Eq, startInterval, false));
                  } else {
                    equals.push(new Query.DatePredicate(property.name, Query.FilterOperator.Eq, startInterval, true));
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
                  equals.push(new Query.SimplePredicate(property.name, Query.FilterOperator.Eq, booleanValue));
                } else {
                  if (!e.context) {
                    console.error(`Failed to convert \"${e.searchOptions.queryString}\" to boolean type`);
                  }
                }

                break;
              default:
                equals.push(new Query.StringPredicate(property.name).contains(e.searchOptions.queryString));

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
      filter = new Query.ComplexPredicate(Query.Condition.Or, ...equals);
    }

    let featuresPromise = this._getFeature(filter, e.searchOptions.maxResultsCount + 1);

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
          linkEquals.pushObject(new Query.ComplexPredicate(Query.Condition.And, ...equals));
        }
      }
    });

    let filter = linkEquals.length === 1 ? linkEquals[0] : new Query.ComplexPredicate(Query.Condition.Or, ...linkEquals);

    let featuresPromise = this._getFeature(filter);

    return featuresPromise;
  },

  /**
    Get an array of link parameter restrictions.
    @method getFilterParameters
    @param {Object[]} linkParameter containing metadata for query
    @param {Object} queryFilter Object with query filter parameteres
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
          propertyEquals.pushObject(new Query.SimplePredicate(property, Query.FilterOperator.Eq, value));
        });

        if (propertyEquals.length === 1) {
          equals.pushObject(propertyEquals[0]);
        } else {
          equals.pushObject(new Query.ComplexPredicate(Query.Condition.Or, ...propertyEquals));
        }
      } else {
        equals.pushObject(new Query.SimplePredicate(property, Query.FilterOperator.Eq, propertyValue));
      }
    });

    return equals;
  },

  /**
    Get properties from model to be showed in attribute panel

    @method _getPropsfromModel
    @param {Ember.Model} model feature's model
  */
  _getPropsfromModel(model) {
    let props = [];
    for (let prop in model.toJSON()) {
      let postfix = '';
      if (model.get(prop) instanceof Object && model.get(`${prop}.name`)) {
        postfix = '.name';
      }

      props.push(`${prop}${postfix}`);
    }

    return props;
  },

  /**
    Set properties from model to be showed in attribute panel

    @method _setPropsFromModel
    @param {Ember.Model} model feature's model
  */
  _setPropsFromModel(model, leafletObject) {
    if (!leafletObject.properties) {
      leafletObject.properties = this._getPropsfromModel(model);
    }

    let props = {};
    leafletObject.properties.forEach(prop => {
      props[prop] = model.get(`${prop}`);
    });
    props.primarykey = Ember.get(model, 'id');
    return props;
  },

  _addLayersOnMap(layers, leafletObject) {
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    layers.forEach((layer) => {
      leafletObject.addLayer(layer, leafletObject);
    });

    this._super(...arguments);
  },

  /**
    Adds layer object.

    @method addLayerObject
    @param layer
    @param model
    @param add Flag which indicate add object on the map or not
  */
  addLayerObject(layer, model, add = true) {
    const geometryField = this.get('geometryField') || 'geometry';
    const geometry = model.get(geometryField);
    if (!geometry) {
      return;
    }

    const geometryCoordinates = this.transformToLatLng(geometry.coordinates);

    let innerLayer;
    if (geometry.type === 'Polygon') {
      innerLayer = L.polygon(geometryCoordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      innerLayer = L.polygon(geometryCoordinates);
    } else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
      innerLayer = L.polyline(geometryCoordinates);
    } else if (geometry.type === 'Point') {
      innerLayer = L.marker(geometryCoordinates);
    }

    if (innerLayer) {
      innerLayer.state = state.exist;
      this._setLayerProperties(innerLayer, model, geometry);
      if (add) {
        L.FeatureGroup.prototype.addLayer.call(layer, innerLayer);
      }
    }

    return innerLayer;
  },

  /**
    Edit layer object properties

    @method editLayerObjectProperties
    @param {Ember.Model} model feature's model
    @param {Object} objectProperties feature's properties
  */
  editLayerObjectProperties(model, objectProperties) {
    if (model) {
      model.setProperties(objectProperties);
    }
  },

  /**
    Creates adapter for model. Need to redefine it in the application project
    if there is a specific application adapter.

    @method createAdapterForModel
    @return {Object} Adapter for model
  */
  createAdapterForModel() {
    let odataUrl = this.get('odataUrl');
    if (Ember.isNone(odataUrl)) {
      return;
    }

    let modelAdapter = GisAdapter.extend(Projection.AdapterMixin, {
      host: odataUrl
    });

    return modelAdapter;
  },

  /**
    Creates model from mixin.

    @method createModel
    @param {Object} modelMixin Model of mixin.
    @return {Object} Model
  */
  createModel(modelMixin) {
    let namespace = this.get('namespace');
    let model = Projection.Model.extend(modelMixin);
    model.reopenClass({
      namespace: namespace
    });

    return model;
  },

  /**
    Creates projection from data model.

    @method createProjection
    @param {Object} jsonModel Data model in json format.
    @return {Object} Projection
  */
  createProjection(jsonModel) {
    let projectionName = this.get('projectionName');
    let projJson = jsonModel.projections.filter(proj => proj.name === projectionName);
    let modelProjection = {};
    if (projJson.length > 0) {
      projJson[0].attrs.forEach((attr) => {
        modelProjection[attr.name] = Projection.attr('');
      });
    }

    return modelProjection;
  },

  /**
    Creates mixin from data model.

    @method createMixin
    @param {Object} jsonModel Data model in json format.
    @return {Object} Mixin
  */
  createMixin(jsonModel) {
    if (Ember.isNone(jsonModel)) {
      return;
    }

    let mixin = {};
    jsonModel.attrs.forEach((attr) => {
      mixin[attr.name] = DS.attr(attr.type);
    });

    let modelMixin = Ember.Mixin.create(mixin);
    return modelMixin;
  },

  /**
    Creates serializer from Serializer.Odata.

    @method createSerializer
    @return {Object} Serializer
  */
  createSerializer() {
    let serializer = Ember.Mixin.create({
      primaryKey: '__PrimaryKey',
      getAttrs: function () {
        let parentAttrs = this._super();
        let attrs = {

        };

        return Ember.$.extend(true, {}, parentAttrs, attrs);
      },
      init: function () {
        this.set('attrs', this.getAttrs());
        this._super(...arguments);
      }
    });

    let baseSerializer;
    let odataSerializer = this.get('odataSerializer');
    if (!Ember.isNone(odataSerializer)) {
      baseSerializer = Ember.getOwner(this)._lookupFactory(`serializer:${odataSerializer}`);
    }

    let modelSerializer = !Ember.isNone(baseSerializer) ? baseSerializer.extend(serializer) : Serializer.Odata.extend(serializer);

    return modelSerializer;
  },

  /**
    Creates models in recursive.

    @method сreateModelHierarchy
    @param {String} metadataUrl
    @param {String} modelName
    @return {Promise} Object consists of model, json data and mixin.
  */
  сreateModelHierarchy(metadataUrl, modelName) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!Ember.isNone(modelName) && !Ember.isNone(metadataUrl)) {
        let _this = this;
        Ember.$.ajax({
          url: metadataUrl + modelName + '.json',
          async: true,
          success: function (dataModel) {
            if (!Ember.isNone(dataModel)) {
              let parentModelName = dataModel.parentModelName;
              if (Ember.isNone(parentModelName)) {
                _this.set('namespace', dataModel.nameSpace);
                let modelMixin = _this.createMixin(dataModel);
                let model = _this.createModel(modelMixin);
                resolve({ model: model, dataModel: dataModel, modelMixin: modelMixin });
              } else {
                _this.сreateModelHierarchy(metadataUrl, parentModelName).then(({ model }) => {
                  let mMixin = _this.createMixin(dataModel);
                  let mModel = model.extend(mMixin, {});
                  mModel.reopenClass({
                    _parentModelName: parentModelName,
                    namespace: _this.get('namespace')
                  });

                  resolve({ model: mModel, dataModel: dataModel, modelMixin: mMixin });
                }).catch((e) => {
                  reject('Can\'t create parent model: ' + parentModelName + ' .Error: ' + e);
                });
              }
            }
          },
          error: function (e) {
            reject('Can\'t create model: ' + modelName + ' .Error: ' + e);
          }
        });
      } else {
        reject('ModelName and metadataUrl is empty');
      }
    });
  },

  /**
    Creates model mixin, model, projections, serializer and adapter from jsonModel and registers them.

    @method createDynamicModel
    @return {Promise}
  */
  createDynamicModel() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let modelName = this.get('modelName');
      let projectionName = this.get('projectionName');
      let metadataUrl = this.get('metadataUrl');

      let modelRegistered = Ember.getOwner(this)._lookupFactory(`model:${modelName}`);
      let mixinRegistered = Ember.getOwner(this)._lookupFactory(`mixin:${modelName}`);
      let serializerRegistered = Ember.getOwner(this)._lookupFactory(`serializer:${modelName}`);
      let adapterRegistered = Ember.getOwner(this)._lookupFactory(`adapter:${modelName}`);

      if (Ember.isNone(serializerRegistered)) {
        let modelSerializer = this.createSerializer();
        Ember.getOwner(this).register(`serializer:${modelName}`, modelSerializer);
      }

      if (Ember.isNone(adapterRegistered)) {
        let modelAdapter = this.createAdapterForModel();
        Ember.getOwner(this).register(`adapter:${modelName}`, modelAdapter);
      }

      if (Ember.isNone(modelRegistered) || Ember.isNone(mixinRegistered)) {
        this.сreateModelHierarchy(metadataUrl, modelName).then(({ model, dataModel, modelMixin }) => {
          model.defineProjection(projectionName, modelName, this.createProjection(dataModel));

          // Необходимо еще раз проверить регистрацию, т.к. могут быть слои с одной моделью, а код - асинхронный
          modelRegistered = Ember.getOwner(this)._lookupFactory(`model:${modelName}`);
          mixinRegistered = Ember.getOwner(this)._lookupFactory(`mixin:${modelName}`);

          if (Ember.isNone(modelRegistered)) {
            Ember.getOwner(this).register(`model:${modelName}`, model);
          }

          if (Ember.isNone(mixinRegistered)) {
            Ember.getOwner(this).register(`mixin:${modelName}`, modelMixin);
          }

          resolve('Create dynamic model: ' + modelName);
        }).catch((e) => {
          reject('Can\'t create dynamic model: ' + modelName + '. Error: ' + e);
        });
      } else {
        resolve('Model already registered: ' + modelName);
      }
    });
  },

  /**
    Creates leaflet layer.

    @method _createVectorLayer
    @return {Object} Layer
  */
  _createVectorLayer() {
    let obj = this.get('_adapterStoreModelProjectionGeom');
    let crs = this.get('crs');

    let continueLoading = this.get('continueLoading');
    let showExisting = this.get('showExisting');
    let dynamicModel = this.get('dynamicModel');

    const options = this.get('options');
    let layer = L.featureGroup();

    layer.options.crs = crs;
    layer.options.style = this.get('styleSettings');
    layer.options.continueLoading = continueLoading;
    layer.options.showExisting = showExisting;
    layer.options.dynamicModel = dynamicModel;
    layer.options.metadataUrl = this.get('metadataUrl');
    layer.options.odataUrl = this.get('odataUrl');
    layer.options.filter = this.get('filter');

    L.setOptions(layer, options);
    layer.minZoom = this.get('minZoom');
    layer.maxZoom = this.get('maxZoom');
    layer.save = this.get('save').bind(this);
    layer.reload = this.get('reload').bind(this);
    layer.geometryField = obj.geometryField;
    layer.addLayer = this.get('addLayer').bind(this);
    layer.editLayerObjectProperties = this.get('editLayerObjectProperties').bind(this);
    layer.editLayer = this.get('editLayer').bind(this);
    layer.removeLayer = this.get('removeLayer').bind(this);
    layer.modelName = obj.modelName;
    layer.projectionName = obj.projectionName;
    layer.editformname = obj.modelName + this.get('postfixForEditForm');
    layer.loadLayerFeatures = this.get('loadLayerFeatures').bind(this);
    layer.models = Ember.A();
    layer.clearLayers = this.get('clearLayers').bind(this);
    layer.cancelEdit = this.get('cancelEdit').bind(this);
    layer.updateLabel = this.get('updateLabel').bind(this);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      let thisPane = this.get('_pane');
      let pane = leafletMap.getPane(thisPane);
      if (!pane || Ember.isNone(pane)) {
        this._createPane(thisPane);
        layer.options.pane = thisPane;
        layer.options.renderer = this.get('_renderer');
        this._setLayerZIndex();
      }
    }

    // for check zoom
    layer.leafletMap = leafletMap;
    this.set('loadedBounds', null);
    this._setFeaturesProcessCallback(layer);
    let load = this.continueLoad(layer);
    layer.promiseLoadLayer = load && load instanceof Ember.RSVP.Promise ? load : Ember.RSVP.resolve();
    return layer;
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // Retrieve possibly defined in layer's settings filter.
      let filter = this.get('filter');
      if (typeof filter === 'string') {
        filter = Ember.getOwner(this).lookup('layer:odata-vector').parseFilter(filter, (this.get('geometryField') || 'geometry'));
      }

      this.set('filter', filter);

      if (this.get('dynamicModel')) {
        this.createDynamicModel().then(() => {
          let layer = this._createVectorLayer();
          resolve(layer);
        }).catch((e) => {
          reject(e);
        });
      } else {
        let layer = this._createVectorLayer();
        resolve(layer);
      }
    });
  },

  transformToLatLng(coordinates) {
    if (Array.isArray(coordinates[0])) {
      let latLngs = [];
      for (let i = 0; i < coordinates.length; i++) {
        latLngs.push(this.transformToLatLng(coordinates[i]));
      }

      return latLngs;
    }

    const crs = this.get('crs');
    const point = L.point(coordinates);

    return crs.unproject(point);
  },

  createReadFormat() {
    let crs = this.get('crs');
    let geometryField = this.get('geometryField') || 'geometry';
    let readFormat = new L.Format.GeoJSON({ crs, geometryField });
    readFormat.featureType = new L.GML.FeatureType({
      geometryField: geometryField
    });

    // у odata ключ никогда не бывает в представлении, чтобы его показывать необходимо добавить вручную
    let pkField = this.getPkField(this.get('layerModel'));
    readFormat.featureType.appendField(pkField, 'string');

    let store = Ember.getOwner(this).lookup('service:store');
    let modelConstructor = store.modelFor(this.get('modelName'));
    let layerProperties = Ember.get(modelConstructor, `attributes`);

    layerProperties.forEach((property) => {
      if (property.name !== geometryField) {
        readFormat.featureType.appendField(property.name, property.type);
      }
    });

    readFormat.featureType.geometryFields[geometryField] = this.get('geometryType');

    // это поля, которые исключены из РЕДАКТИРОВАНИЯ
    readFormat.excludedProperties = [pkField, 'creator', 'editor', 'createTime', 'editTime'];
    return readFormat;
  },

  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions(source) {
    return this._super(...arguments).then((attributesOptions) => {

      Ember.set(attributesOptions, 'settings.readonly', this.get('readonly') || false);

      let excluded = Ember.get(attributesOptions, 'settings.excludedProperties');
      if (Ember.isNone(excluded)) {
        excluded = Ember.A();
      }

      let extraExcluded = source && source === 'identify' ? Ember.A(['syncDownTime', 'readOnly']) : Ember.A(['syncDownTime', 'readOnly', 'intersectionArea']);

      extraExcluded.forEach((p) => {
        if (!excluded.contains(p)) {
          excluded.pushObject(p);
        }
      });

      Ember.set(attributesOptions, 'settings.excludedProperties', excluded);

      return attributesOptions;
    });
  },

  _adapterStoreModelProjectionGeom: Ember.computed('modelName', 'projectionName', 'geometryField', 'store', function () {
    const modelName = this.get('modelName');
    const projectionName = this.get('projectionName');
    const geometryField = this.get('geometryField') || 'geometry';
    const store = this.get('store');
    let adapter = store.adapterFor(modelName);
    if (!adapter) {
      adapter = store.adapterFor('application');
    }

    if (!modelName) {
      return;
    }

    return {
      store: store,
      modelName: modelName,
      geometryField: geometryField,
      projectionName: projectionName,
      adapter: adapter
    };
  }),

  /**
    Handles 'flexberry-map:loadLayerFeatures' event of leaflet map.

    @method loadLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  loadLayerFeatures(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      try {
        let leafletObject = this.get('_leafletObject');
        let featureIds = e.featureIds;

        if (!leafletObject.options.showExisting || e.loadNew) {
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
                equals.pushObject(new Query.SimplePredicate('id', Query.FilterOperator.Eq, id));
              });

              if (equals.length === 1) {
                return equals[0];
              } else {
                return new Query.ComplexPredicate(Query.Condition.Or, ...equals);
              }
            }

            return null;
          };

          let obj = this.get('_adapterStoreModelProjectionGeom');
          let queryBuilder = new Builder(obj.store)
            .from(obj.modelName)
            .selectByProjection(obj.projectionName);

          if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {// load features by id
            let loadIds = getLoadedFeatures(featureIds);

            let remainingFeat = featureIds.filter((item) => {
              return loadIds.indexOf(item) === -1;
            });

            if (!Ember.isEmpty(remainingFeat)) {
              queryBuilder.where(this.addCustomFilter(makeFilterEqOr(remainingFeat)));
            } else { // If objects is already loaded, return leafletObject
              resolve(leafletObject);
              return;
            }
          } else {// load objects that don't exist yet
            let alreadyLoaded = getLoadedFeatures(null);
            let filterEqOr = makeFilterEqOr(alreadyLoaded);
            if (!Ember.isNone(filterEqOr)) {
              queryBuilder.where(this.addCustomFilter(new Query.NotPredicate(makeFilterEqOr(alreadyLoaded))));
            }
          }

          let objs = obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store);

          objs.then(res => {
            let models = res;
            if (typeof res.toArray === 'function') {
              models = res.toArray();
            }

            let innerLayers = [];
            models.forEach(model => {
              let l = this.addLayerObject(leafletObject, model, false);
              innerLayers.push(l);
            });
            this._setLayerState();

            let e = { layers: innerLayers, results: Ember.A() };
            leafletObject.fire('load', e);

            Ember.RSVP.allSettled(e.results).then(() => {
              resolve(leafletObject);
            });
          });
        } else {
          resolve(leafletObject);
        }
      } catch (e) {
        reject(e);
      }
    });
  },

  /**
    Get count of features.

    @method getCountFeatures
    @return {Promise} count of features.
  */
  getCountFeatures() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const store = this.get('store');
      const modelName = this.get('modelName');
      const projectionName = this.get('projectionName');
      let queryBuilder = new Builder(store)
        .from(modelName)
        .selectByProjection(projectionName)
        .top(1)
        .count();

      let filter = this.addCustomFilter(null);
      if (!Ember.isNone(filter)) {
        queryBuilder.where(filter);
      }

      store.query(modelName, queryBuilder.build()).then((result) => {
        resolve(result.meta.count);
      });
    });
  },

  customFilter: Ember.computed('layerModel.archTime', 'hasTime', 'modelName', function () {
    let predicates = [];
    if (this.get('hasTime')) {
      let time = this.get('layerModel.archTime');
      let formattedTime;
      if (Ember.isBlank(time) || time === 'present' || Ember.isNone(time)) {
        formattedTime = moment().toISOString();
      } else {
        formattedTime = moment(time).toISOString();
      }

      predicates.push(new Query.DatePredicate('archiveStart', Query.FilterOperator.Leq, formattedTime));
    }

    predicates.push(new Query.IsOfPredicate(this.get('modelName')));

    if (predicates.length > 0) {
      if (predicates.length === 1) {
        return predicates[0];
      } else {
        return new Query.ComplexPredicate(Query.Condition.And, ...predicates);
      }
    }

    return null;
  }),

  addCustomFilter(filter) {
    let customFilter = this.get('customFilter');
    let layerFilter = this.get('filter');
    let resultFilter = Ember.A();
    if (!Ember.isNone(layerFilter) && layerFilter instanceof Query.BasePredicate) {
      resultFilter.pushObject(layerFilter);
    }

    if (!Ember.isNone(filter) && filter instanceof Query.BasePredicate) {
      resultFilter.pushObject(filter);
    }

    if (!Ember.isNone(customFilter) && customFilter instanceof Query.BasePredicate) {
      resultFilter.pushObject(customFilter);
    }

    if (resultFilter.length === 0) {
      return null;
    } else if (resultFilter.length === 1) {
      return resultFilter[0];
    } else {
      return new Query.ComplexPredicate(Query.Condition.And, ...resultFilter);
    }
  },

  /**
    Handles 'flexberry-map:getLayerFeatures' event of leaflet map.

    @method getLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  getLayerFeatures(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      try {
        let leafletObject = this.get('_leafletObject');
        let featureIds = e.featureIds;
        if (!leafletObject.options.showExisting) {
          let obj = this.get('_adapterStoreModelProjectionGeom');

          let getLoadedFeatures = (loadedModels) => {
            let models = loadedModels;
            if (typeof loadedModels.toArray === 'function') {
              models = loadedModels.toArray();
            }

            let result = [];
            models.forEach(model => {
              result.push(this.addLayerObject(leafletObject, model, false));
            });

            return result;
          };

          if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
            let equals = Ember.A();
            featureIds.forEach((id) => {
              equals.pushObject(new Query.SimplePredicate('id', Query.FilterOperator.Eq, id));
            });

            let queryBuilder = new Builder(obj.store)
              .from(obj.modelName)
              .selectByProjection(obj.projectionName);

            if (equals.length === 1) {
              queryBuilder.where(this.addCustomFilter(equals[0]));
            } else {
              queryBuilder.where(this.addCustomFilter(new Query.ComplexPredicate(Query.Condition.Or, ...equals)));
            }

            let objs = obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store);

            objs.then(res => {
              resolve(getLoadedFeatures(res));
            }).catch((e) => {
              reject('error');
            });
          } else { // all layer
            this.getCountFeatures().then((res) => {
              let promises = Ember.A();
              let count = res;
              let skip = 0;
              do {
                let queryBuilder = new Builder(obj.store)
                  .from(obj.modelName)
                  .selectByProjection(obj.projectionName)
                  .top(maxBatchFeatures)
                  .skip(skip)
                  .orderBy('id');

                let customFilter = this.addCustomFilter(null);
                if (!Ember.isNone(customFilter)) {
                  queryBuilder.where(customFilter);
                }

                promises.push(obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store));
                count -= maxBatchFeatures;
                skip += maxBatchFeatures;
              } while (count - maxBatchFeatures >= 0);

              if (count > 0) {
                let queryBuilder = new Builder(obj.store)
                  .from(obj.modelName)
                  .selectByProjection(obj.projectionName)
                  .top(count)
                  .skip(skip)
                  .orderBy('id');

                let customFilter = this.addCustomFilter(null);
                if (!Ember.isNone(customFilter)) {
                  queryBuilder.where(customFilter);
                }

                promises.push(obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store));
              }

              Ember.RSVP.all(promises).then((res) => {
                let result = [];
                res.forEach((loadedModels) => {
                  result = result.concat(getLoadedFeatures(loadedModels));
                });
                resolve(result);
              }).catch((e) => {
                reject('error');
              });
            });
          }
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
      } catch (e) {
        reject(e);
      }
    });
  },

  /**
    Handles zoomend
  */
  continueLoad(leafletObject) {
    if (!leafletObject || !(leafletObject instanceof L.FeatureGroup)) {
      leafletObject = this.get('_leafletObject');
    }

    if (!Ember.isNone(leafletObject)) {
      // it's from api showAllLayerObjects, to load objects if layer is not visibility
      let showLayerObjects = (!Ember.isNone(leafletObject.showLayerObjects) && leafletObject.showLayerObjects);
      let show = this.get('visibility');
      let continueLoad = !leafletObject.options.showExisting && leafletObject.options.continueLoading;
      let showExisting = leafletObject.options.showExisting && !leafletObject.options.continueLoading && Ember.isEmpty(Object.values(leafletObject._layers));

      let promise;

      if ((continueLoad && show && checkMapZoom(leafletObject)) || (showLayerObjects && continueLoad)) {
        let loadedBounds = this.get('loadedBounds');
        let leafletMap = this.get('leafletMap');
        let obj = this.get('_adapterStoreModelProjectionGeom');
        let bounds = L.rectangle(leafletMap.getBounds());
        if (!Ember.isNone(leafletObject.showLayerObjects)) {
          leafletObject.showLayerObjects = false;
        }

        let oldPart;
        if (!Ember.isNone(loadedBounds)) {
          if (loadedBounds instanceof L.LatLngBounds) {
            loadedBounds = L.rectangle(loadedBounds);
          }

          let loadedBoundsJsts = loadedBounds.toJsts(L.CRS.EPSG4326);
          let boundsJsts = bounds.toJsts(L.CRS.EPSG4326);

          if (loadedBoundsJsts.contains(boundsJsts)) {
            if (leafletObject.statusLoadLayer) {
              leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
            }

            return Ember.RSVP.resolve('Features in bounds is already loaded');
          }

          let queryOldBounds = new Query.GeometryPredicate(obj.geometryField);
          oldPart = new Query.NotPredicate(queryOldBounds.intersects(loadedBounds.toEWKT(this.get('crs'))));

          let unionJsts = loadedBoundsJsts.union(boundsJsts);
          let geojsonWriter = new jsts.io.GeoJSONWriter();
          loadedBounds = L.geoJSON(geojsonWriter.write(unionJsts)).getLayers()[0];
        } else {
          loadedBounds = bounds;
        }

        this.set('loadedBounds', loadedBounds);

        let queryNewBounds = new Query.GeometryPredicate(obj.geometryField);
        let newPart = queryNewBounds.intersects(loadedBounds.toEWKT(this.get('crs')));
        let filter = oldPart ? new Query.ComplexPredicate(Query.Condition.And, oldPart, newPart) : newPart;

        promise = this._downloadFeaturesWithOrNotFilter(leafletObject, obj, filter);
      } else if (showExisting || (showExisting && showLayerObjects)) {
        promise = this._downloadFeaturesWithOrNotFilter(leafletObject, this.get('_adapterStoreModelProjectionGeom'), null);
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

  _downloadFeaturesWithOrNotFilter(leafletObject, obj, filter) {
    let queryBuilder = new Builder(obj.store)
      .from(obj.modelName)
      .selectByProjection(obj.projectionName);

    filter = this.addCustomFilter(filter);
    if (!Ember.isNone(filter)) {
      queryBuilder.where(filter);
    }

    let objs = obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store);

    let promise = new Ember.RSVP.Promise((resolve, reject) => {
      objs.then(res => {
        let models = res;
        if (typeof res.toArray === 'function') {
          models = res.toArray();
        }

        let innerLayers = [];
        models.forEach(model => {
          let l = this.addLayerObject(leafletObject, model, false);
          innerLayers.push(l);
        });

        let e = { layers: innerLayers, results: Ember.A() };
        leafletObject.fire('load', e);

        Ember.RSVP.allSettled(e.results).then(() => {
          this._setLayerState();
          resolve();
        });
      });
    });

    if (leafletObject.statusLoadLayer) {
      leafletObject.promiseLoadLayer = promise;
    }

    return promise;
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
    let changes = leafletObject.models.filter((item) => true); // for check empty
    if (!Ember.isEmpty(changes)) {
      Object.entries(leafletObject.models)
        .filter((item) => { return Ember.isNone(ids) || ids.contains(leafletObject.getLayerId(leafletObject.getLayer(item[0]))); })
        .map((item) => item[1])
        .forEach((model, index) => {
          if (model instanceof Ember.Object) {
            let layer = Object.values(leafletObject._layers).find((layer) => {
              if (layer.model.get('id') === model.get('id')) {
                return layer;
              }
            });

            let dirtyType = model.get('dirtyType');
            if (dirtyType === 'created') {
              if (leafletObject.hasLayer(layer)) {
                leafletObject.removeLayer(layer);
              }

              delete leafletObject.models[index];
              if (editTools.featuresLayer.getLayers().length !== 0) {
                let editorLayerId = editTools.featuresLayer.getLayerId(layer);
                let featureLayer = editTools.featuresLayer.getLayer(editorLayerId);
                if (!Ember.isNone(editorLayerId) && !Ember.isNone(featureLayer) && !Ember.isNone(featureLayer.editor)) {
                  let editLayer = featureLayer.editor.editLayer;
                  editTools.editLayer.removeLayer(editLayer);
                  editTools.featuresLayer.removeLayer(layer);
                }
              }
            } else if (dirtyType === 'updated' || dirtyType === 'deleted') {
              if (!Ember.isNone(layer)) {
                if (!Ember.isNone(layer.editor)) {
                  let editLayer = layer.editor.editLayer;
                  editTools.editLayer.removeLayer(editLayer);
                }

                if (leafletObject.hasLayer(layer)) {
                  leafletObject.removeLayer(layer);
                }
              }

              model.rollbackAttributes();
              delete leafletObject.models[index];
              featuresIds.push(model.get('id'));
            }
          }
        });

      if (!Ember.isNone(ids)) {
        ids.forEach((id) => {
          delete leafletObject.models[id];
        });
      } else {
        editTools.editLayer.clearLayers();
      }
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
    Get nearest object.
    Gets all leaflet layer objects and processes them _calcNearestObject().

    @method getNearObject
    @param {Object} e Event object..
    @param {Object} featureLayer Leaflet layer object.
    @param {Number} featureId Leaflet layer object id.
    @param {Number} layerObjectId Leaflet layer id.
    @return {Ember.RSVP.Promise} Returns object with distance, layer model and nearest leaflet layer object.
  */
  getNearObject(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let obj = this.get('_adapterStoreModelProjectionGeom');
      let layerModel = this.get('layerModel');
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let mapApi = this.get('mapApi').getFromApi('mapModel');
      let _this = this;
      Ember.$.ajax({
        url: layerModel.get('_leafletObject.options.metadataUrl') + layerModel.get('_leafletObject.modelName') + '.json',
        success: function (dataClass) {
          let odataQueryName = Ember.String.pluralize(capitalize(camelize(dataClass.modelName)));
          let odataUrl = _this.get('odataUrl');
          obj.adapter.callAction(
            config.APP.backendActions.getNearDistance,
            {
              geom: L.marker(mapApi.getObjectCenter(e.featureLayer)).toEWKT(_this.get('crs')),
              odataQueryName: odataQueryName,
              odataProjectionName: obj.projectionName
            },
            odataUrl,
            null,
            (data) => {
              new Ember.RSVP.Promise((resolve) => {
                const normalizedRecords = { data: Ember.A(), included: Ember.A() };
                let odataValue = data.value;
                if (!Ember.isNone(odataValue) && Array.isArray(odataValue)) {
                  odataValue.forEach(record => {
                    if (record.hasOwnProperty('@odata.type')) {
                      delete record['@odata.type'];
                    }

                    const normalized = obj.store.normalize(obj.modelName, record);
                    normalizedRecords.data.addObject(normalized.data);
                    if (normalized.included) {
                      normalizedRecords.included.addObjects(normalized.included);
                    }
                  });
                }

                resolve(Ember.run(obj.store, obj.store.push, normalizedRecords));
              }).then((result) => {
                let features = Ember.A();
                let models = result;
                if (typeof result.toArray === 'function') {
                  models = result.toArray();
                }

                let layer = L.featureGroup();

                models.forEach(model => {
                  let feat = _this.addLayerObject(layer, model, false);
                  features.push(feat.feature);
                });

                const distance = mapApi._getDistanceBetweenObjects(e.featureLayer, features[0].leafletLayer);
                resolve({
                  distance: distance,
                  layer: layerModel,
                  object: features[0].leafletLayer,
                });
              });
            },
            (message) => {
              reject(message);
            }
          );
        }
      });
    });
  }
});
