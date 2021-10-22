/**
  @module ember-flexberry-gis
*/

import { run } from '@ember/runloop';

import Mixin from '@ember/object/mixin';
import { A, isArray } from '@ember/array';
import { getOwner } from '@ember/application';
import {
  Promise,
  resolve,
  allSettled,
  all,
  reject
} from 'rsvp';
import $ from 'jquery';
import { isNone, isBlank, isEmpty } from '@ember/utils';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import GisAdapter from 'ember-flexberry-gis/adapters/odata';
import DS from 'ember-data';
import jsts from 'npm:jsts';
import { capitalize, camelize } from 'ember-flexberry-data/utils/string-functions';
import AdapterMixin from 'ember-flexberry-data/mixins/adapter';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import { attr } from 'ember-flexberry-data/utils/attributes';
import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import Condition from 'ember-flexberry-data/query/condition';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';

import {
  SimplePredicate,
  ComplexPredicate,
  StringPredicate,
  GeometryPredicate,
  NotPredicate
} from 'ember-flexberry-data/query/predicate';

import QueryBuilder from 'ember-flexberry-data/query/builder';
import state from '../../utils/state';
import { checkMapZoom } from '../../utils/check-zoom';

/**
  For batch reading
*/
const maxBatchFeatures = 10000;

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

  store: service(),

  postfixForEditForm: '-e',

  /**
    Saves layer changes.

    @method save
  */
  save() {
    const leafletObject = this.get('_leafletObject');
    const leafletMap = this.get('leafletMap');
    leafletObject.eachLayer((layer) => {
      if (get(layer, 'model.hasDirtyAttributes')) {
        if (layer.state === state.insert) {
          const coordinates = this._getGeometry(layer);
          set(layer, 'feature.geometry.coordinates', coordinates);
        }
      }
    }, leafletObject);

    const modelsLayer = leafletObject.models;
    if (modelsLayer.length > 0) {
      const insertedIds = leafletObject.getLayers().map((layer) => {
        if (layer.state === state.insert) {
          return layer.feature.properties.primarykey;
        }
      });
      const insertedLayer = leafletObject.getLayers().filter((layer) => layer.state === state.insert);

      const updatedLayer = leafletObject.getLayers().filter((layer) => layer.state === state.update);

      // to send request via the needed adapter
      const obj = this.get('_adapterStoreModelProjectionGeom');
      obj.adapter.batchUpdate(obj.store, modelsLayer).then((models) => {
        modelsLayer.clear();
        const insertedModelId = [];
        if (!isNone(updatedLayer) && updatedLayer.length > 0) {
          updatedLayer.map((layer) => {
            layer.state = state.exist;
          });
        }

        models.forEach((model) => {
          const ids = insertedIds.filter((id) => (isNone(model) ? false : model.get('id') === id));
          if (ids.length > 0) {
            insertedModelId.push(ids[0]);
          }
        });

        insertedLayer.forEach(function (layer) {
          L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
          if (leafletMap.hasLayer(layer._label)) {
            leafletMap.removeLayer(layer._label);
            const id = leafletObject.getLayerId(layer._label);
            delete leafletObject._labelsLayer[id];
          }
        });

        if (insertedModelId.length > 0) {
          this.get('mapApi').getFromApi('mapModel')._getModelLayerFeature(this.layerModel.get('id'), insertedModelId, true)
            .then(([, lObject, featureLayer]) => {
              this._setLayerState();
              leafletObject.fire('save:success', { layers: featureLayer, });
            });
        } else {
          leafletObject.fire('save:success', { layers: [], });
        }
      }).catch(function (e) {
        console.error(`Error save: ${e}`);
        leafletObject.fire('save:failed', e);
      });
    } else {
      leafletObject.fire('save:success', { layers: [], });
    }

    return leafletObject;
  },

  /**
    Trigers after layer was edited.

    @method editLayer
    @param layer
  */
  editLayer(layer) {
    const leafletObject = this.get('_leafletObject');
    if (layer.model) {
      const geometryField = this.get('geometryField') || 'geometry';
      const geometryObject = {};
      geometryObject.coordinates = this._getGeometry(layer);
      geometryObject.type = get(layer, 'feature.geometry.type');
      geometryObject.crs = {
        properties: { name: this.get('crs.code'), },
        type: 'name',
      };
      set(layer, 'feature.geometry.coordinates', geometryObject.coordinates);
      layer.model.set(geometryField, geometryObject);
      if (layer.state !== state.insert) {
        layer.state = state.update;
      }

      const id = leafletObject.getLayerId(layer);
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
    const leafletObject = this.get('_leafletObject');

    if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
      L.FeatureGroup.prototype.removeLayer.call(leafletObject._labelsLayer, layer._label);
      layer._label = null;
      this._createStringLabel(leafletObject._labelsLayer, [layer]);
    }
  },

  /**
    Removes all the layers from the group.

    @method clearLayers
  */
  clearLayers() {
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
    Deletes model in odata layer.

    @method removeLayer
    @param layer
  */
  removeLayer(layer) {
    const leafletObject = this.get('_leafletObject');
    L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
    const id = leafletObject.getLayerId(layer);

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

    if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
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

    if (layer.state && layer.state !== state.insert) {
      L.FeatureGroup.prototype.addLayer.call(leafletObject, layer);
      return;
    }

    const featureProperties = $.extend({ id: generateUniqueId(), }, layer.feature.properties);
    const model = this.get('store').createRecord(this.get('modelName'), featureProperties);
    const geometryField = this.get('geometryField') || 'geometry';
    const geometryObject = {};
    const typeModel = this.get('geometryType');
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
        throw `Unknown type ${typeModel}`;
    }

    geometryObject.coordinates = this._getGeometry(layer);
    geometryObject.crs = {
      properties: { name: this.get('crs.code'), },
      type: 'name',
    };

    model.set(geometryField, geometryObject);
    model.set('id', generateUniqueId());
    layer.state = state.insert;
    this._setLayerProperties(layer, model, geometryObject);
    L.FeatureGroup.prototype.addLayer.call(leafletObject, layer);
    const id = leafletObject.getLayerId(layer);
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
      geometry,
      leafletLayer: layer,
    };

    layer.feature.properties = new Proxy(model, {
      get(target, prop) {
        if (prop === 'primarykey') {
          return target.get('id');
        }

        return target.get(prop);
      },
      set(target, prop, value) {
        if (prop === 'primarykey') {
          target.set('id', value);
        } else {
          target.set(prop, value);
        }

        return true;
      },
      ownKeys(target) {
        const modelKeys = Object.keys(target.toJSON());
        modelKeys.push('primarykey');
        return modelKeys;
      },
      getOwnPropertyDescriptor(target, name) {
        const proxy = this;
        return {
          get value() { return proxy.get(target, name); }, configurable: true, enumerable: true, writable: true,
        };
      },
      has(target, prop) {
        return target.has(prop);
      },
    });

    layer.feature.id = `${this.get('modelName')}.${layer.feature.properties.primarykey}`;
    layer.leafletMap = this.get('leafletMap');

    const pane = this.get('_pane');
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
    return new Promise((resolve, reject) => {
      const obj = this.get('_adapterStoreModelProjectionGeom');

      const queryBuilder = new QueryBuilder(obj.store)
        .from(obj.modelName)
        .selectByProjection(obj.projectionName);

      if (!isNone(maxFeatures)) {
        queryBuilder.top(maxFeatures);
      }

      filter = this.addCustomFilter(filter);
      if (!isNone(filter)) {
        queryBuilder.where(filter);
      }

      const build = queryBuilder.build();
      const config = getOwner(this).resolveRegistration('config:environment');
      const { intersectionArea, } = config.APP;
      if (isIdentify && build.select.indexOf(intersectionArea) === -1) {
        build.select.push(intersectionArea);
      }

      const objs = obj.adapter.batchLoadModel(obj.modelName, build, obj.store);
      objs.then((res) => {
        const features = A();
        let models = res;
        if (typeof res.toArray === 'function') {
          models = res.toArray();
        }

        const layer = L.featureGroup();

        models.forEach((model) => {
          const feat = this.addLayerObject(layer, model, false);
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
  * */
  identify(e) {
    const geometryField = this.get('geometryField') || 'geometry';
    const pred = new GeometryPredicate(geometryField);
    const predicate = pred.intersects(e.polygonLayer.toEWKT(this.get('crs')));
    const featuresPromise = this._getFeature(predicate, null, true);
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
      const type = this.get('layerModel.type');
      if (!isBlank(type)) {
        const layerClass = getOwner(this).knownForType('layer', type);
        const layerProperties = layerClass.getLayerProperties(leafletObject);
        searchFields.forEach((field) => {
          const ind = layerProperties.indexOf(field);
          if (ind > -1) {
            const layerPropertyType = typeof layerClass.getLayerPropertyValues(leafletObject, layerProperties[ind], 1)[0];
            const layerPropertyValue = layerClass.getLayerPropertyValues(leafletObject, layerProperties[ind], 1)[0];
            if (layerPropertyType !== 'string' || (layerPropertyType === 'object' && layerPropertyValue instanceof Date)) {
              equals.push(new SimplePredicate(field, FilterOperator.Eq, e.searchOptions.queryString));
            } else {
              equals.push(new StringPredicate(field).contains(e.searchOptions.queryString));
            }
          }
        });
      }
    }

    let filter;
    if (equals.length === 0) {
      return;
    }

    if (equals.length === 1) {
      filter = equals[0];
    } else {
      filter = new ComplexPredicate(Condition.Or, ...equals);
    }

    const featuresPromise = this._getFeature(filter, e.searchOptions.maxResultsCount);

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
          linkEquals.pushObject(new ComplexPredicate(Condition.And, ...equals));
        }
      }
    });

    const filter = linkEquals.length === 1 ? linkEquals[0] : new ComplexPredicate(Condition.Or, ...linkEquals);

    const featuresPromise = this._getFeature(filter);

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
    const equals = A();

    parameters.forEach((linkParam) => {
      const property = linkParam.get('layerField');
      const propertyValue = queryFilter[linkParam.get('queryKey')];
      if (isArray(propertyValue)) {
        const propertyEquals = A();
        propertyValue.forEach((value) => {
          propertyEquals.pushObject(new SimplePredicate(property, FilterOperator.Eq, value));
        });

        if (propertyEquals.length === 1) {
          equals.pushObject(propertyEquals[0]);
        } else {
          equals.pushObject(new ComplexPredicate(Condition.Or, ...propertyEquals));
        }
      } else {
        equals.pushObject(new SimplePredicate(property, FilterOperator.Eq, propertyValue));
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
    const props = [];
    for (const prop in model.toJSON()) {
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

    const props = {};
    leafletObject.properties.forEach((prop) => {
      props[prop] = model.get(`${prop}`);
    });
    props.primarykey = get(model, 'id');
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
    const odataUrl = this.get('odataUrl');
    if (isNone(odataUrl)) {
      return;
    }

    const modelAdapter = GisAdapter.extend(AdapterMixin, {
      host: odataUrl,
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
    const namespace = this.get('namespace');
    const model = EmberFlexberryDataModel.extend(modelMixin);
    model.reopenClass({
      namespace,
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
    const projectionName = this.get('projectionName');
    const projJson = jsonModel.projections.filter((proj) => proj.name === projectionName);
    const modelProjection = {};
    if (projJson.length > 0) {
      projJson[0].attrs.forEach((attr) => {
        modelProjection[attr.name] = attr('');
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
    if (isNone(jsonModel)) {
      return;
    }

    const mixin = {};
    jsonModel.attrs.forEach((attr) => {
      mixin[attr.name] = DS.attr(attr.type);
    });

    const modelMixin = Mixin.create(mixin);
    return modelMixin;
  },

  /**
    Creates serializer from Serializer.Odata.

    @method createSerializer
    @return {Object} Serializer
  */
  createSerializer() {
    const serializer = Mixin.create({
      primaryKey: '__PrimaryKey',
      getAttrs() {
        const parentAttrs = this._super();
        const attrs = {

        };

        return $.extend(true, {}, parentAttrs, attrs);
      },
      init() {
        this.set('attrs', this.getAttrs());
        this._super(...arguments);
      },
    });

    const modelSerializer = OdataSerializer.extend(serializer);
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
    return new Promise((resolve, reject) => {
      if (!isNone(modelName) && !isNone(metadataUrl)) {
        const _this = this;
        $.ajax({
          url: `${metadataUrl + modelName}.json`,
          async: true,
          success(dataModel) {
            if (!isNone(dataModel)) {
              const { parentModelName, } = dataModel;
              if (isNone(parentModelName)) {
                _this.set('namespace', dataModel.nameSpace);
                const modelMixin = _this.createMixin(dataModel);
                const model = _this.createModel(modelMixin);
                resolve({ model, dataModel, modelMixin, });
              } else {
                _this.сreateModelHierarchy(metadataUrl, parentModelName).then(({ model, }) => {
                  const mMixin = _this.createMixin(dataModel);
                  const mModel = model.extend(mMixin, {});
                  mModel.reopenClass({
                    _parentModelName: parentModelName,
                    namespace: _this.get('namespace'),
                  });

                  resolve({ model: mModel, dataModel, modelMixin: mMixin, });
                }).catch((e) => {
                  reject(`Can't create parent model: ${parentModelName} .Error: ${e}`);
                });
              }
            }
          },
          error(e) {
            reject(`Can't create model: ${modelName} .Error: ${e}`);
          },
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
    return new Promise((resolve, reject) => {
      const modelName = this.get('modelName');
      const projectionName = this.get('projectionName');
      const metadataUrl = this.get('metadataUrl');

      let modelRegistered = getOwner(this)._lookupFactory(`model:${modelName}`);
      let mixinRegistered = getOwner(this)._lookupFactory(`mixin:${modelName}`);
      const serializerRegistered = getOwner(this)._lookupFactory(`serializer:${modelName}`);
      const adapterRegistered = getOwner(this)._lookupFactory(`adapter:${modelName}`);

      if (isNone(serializerRegistered)) {
        const modelSerializer = this.createSerializer();
        getOwner(this).register(`serializer:${modelName}`, modelSerializer);
      }

      if (isNone(adapterRegistered)) {
        const modelAdapter = this.createAdapterForModel();
        getOwner(this).register(`adapter:${modelName}`, modelAdapter);
      }

      if (isNone(modelRegistered) || isNone(mixinRegistered)) {
        this.сreateModelHierarchy(metadataUrl, modelName).then(({ model, dataModel, modelMixin, }) => {
          model.defineProjection(projectionName, modelName, this.createProjection(dataModel));

          // Необходимо еще раз проверить регистрацию, т.к. могут быть слои с одной моделью, а код - асинхронный
          modelRegistered = getOwner(this)._lookupFactory(`model:${modelName}`);
          mixinRegistered = getOwner(this)._lookupFactory(`mixin:${modelName}`);

          if (isNone(modelRegistered)) {
            getOwner(this).register(`model:${modelName}`, model);
          }

          if (isNone(mixinRegistered)) {
            getOwner(this).register(`mixin:${modelName}`, modelMixin);
          }

          resolve(`Create dynamic model: ${modelName}`);
        }).catch((e) => {
          reject(`Can't create dynamic model: ${modelName}. Error: ${e}`);
        });
      } else {
        resolve(`Model already registered: ${modelName}`);
      }
    });
  },

  /**
    Creates leaflet layer.

    @method _createVectorLayer
    @return {Object} Layer
  */
  _createVectorLayer() {
    const obj = this.get('_adapterStoreModelProjectionGeom');
    const crs = this.get('crs');

    const continueLoading = this.get('continueLoading');
    const showExisting = this.get('showExisting');
    const dynamicModel = this.get('dynamicModel');

    const options = this.get('options');
    const layer = L.featureGroup();

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
    layer.models = A();
    layer.clearLayers = this.get('clearLayers').bind(this);
    layer.cancelEdit = this.get('cancelEdit').bind(this);
    layer.updateLabel = this.get('updateLabel').bind(this);

    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      const thisPane = this.get('_pane');
      const pane = leafletMap.getPane(thisPane);
      if (!pane || isNone(pane)) {
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
    const load = this.continueLoad(layer);
    layer.promiseLoadLayer = load && load instanceof Promise ? load : resolve();
    return layer;
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer() {
    return new Promise((resolve, reject) => {
      // Retrieve possibly defined in layer's settings filter.
      let filter = this.get('filter');
      if (typeof filter === 'string') {
        filter = getOwner(this).lookup('layer:odata-vector').parseFilter(filter, (this.get('geometryField') || 'geometry'));
      }

      this.set('filter', filter);

      if (this.get('dynamicModel')) {
        this.createDynamicModel().then(() => {
          const layer = this._createVectorLayer();
          resolve(layer);
        }).catch((e) => {
          reject(e);
        });
      } else {
        const layer = this._createVectorLayer();
        resolve(layer);
      }
    });
  },

  transformToLatLng(coordinates) {
    if (Array.isArray(coordinates[0])) {
      const latLngs = [];
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
    const readFormat = this._super(...arguments);
    readFormat.featureType.geometryFields = [this.get('geometryType')];
    return readFormat;
  },

  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    return this._super(...arguments).then((attributesOptions) => {
      set(attributesOptions, 'settings.readonly', this.get('readonly') || false);
      set(attributesOptions, 'settings.excludedProperties', A(['syncDownTime', 'readOnly', 'creator', 'editor', 'createTime', 'editTime']));
      return attributesOptions;
    });
  },

  _adapterStoreModelProjectionGeom: computed('modelName', 'projectionName', 'geometryField', 'store', function () {
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
      store,
      modelName,
      geometryField,
      projectionName,
      adapter,
    };
  }),

  /**
    Handles 'flexberry-map:loadLayerFeatures' event of leaflet map.

    @method loadLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  loadLayerFeatures(e) {
    return new Promise((resolve, reject) => {
      try {
        const leafletObject = this.get('_leafletObject');
        const { featureIds, } = e;
        if (!leafletObject.options.showExisting) {
          const getLoadedFeatures = (featureIds) => {
            const loadIds = [];
            leafletObject.eachLayer((shape) => {
              const id = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), shape);
              if (!isNone(id) && ((isArray(featureIds) && !isNone(featureIds) && featureIds.indexOf(id) !== -1) || !loadIds.includes(id))) {
                loadIds.push(id);
              }
            });

            return loadIds;
          };

          const makeFilterEqOr = (loadedFeatures) => {
            if (loadedFeatures.length > 0) {
              const equals = A();
              loadedFeatures.forEach((id) => {
                equals.pushObject(new SimplePredicate('id', FilterOperator.Eq, id));
              });

              if (equals.length === 1) {
                return equals[0];
              }

              return new ComplexPredicate(Condition.Or, ...equals);
            }

            return null;
          };

          const obj = this.get('_adapterStoreModelProjectionGeom');
          const queryBuilder = new QueryBuilder(obj.store)
            .from(obj.modelName)
            .selectByProjection(obj.projectionName);

          if (isArray(featureIds) && !isNone(featureIds)) { // load features by id
            const loadIds = getLoadedFeatures(featureIds);

            const remainingFeat = featureIds.filter((item) => loadIds.indexOf(item) === -1);

            if (!isEmpty(remainingFeat)) {
              queryBuilder.where(this.addCustomFilter(makeFilterEqOr(remainingFeat)));
            } else { // If objects is already loaded, return leafletObject
              resolve(leafletObject);
              return;
            }
          } else { // load objects that don't exist yet
            const alreadyLoaded = getLoadedFeatures(null);
            const filterEqOr = makeFilterEqOr(alreadyLoaded);
            if (!isNone(filterEqOr)) {
              queryBuilder.where(this.addCustomFilter(new NotPredicate(makeFilterEqOr(alreadyLoaded))));
            }
          }

          const objs = obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store);

          objs.then((res) => {
            let models = res;
            if (typeof res.toArray === 'function') {
              models = res.toArray();
            }

            const innerLayers = [];
            models.forEach((model) => {
              const l = this.addLayerObject(leafletObject, model, false);
              innerLayers.push(l);
            });
            this._setLayerState();

            const e = { layers: innerLayers, results: A(), };
            leafletObject.fire('load', e);

            allSettled(e.results).then(() => {
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
    return new Promise((resolve, reject) => {
      const store = this.get('store');
      const modelName = this.get('modelName');
      const projectionName = this.get('projectionName');
      const queryBuilder = new QueryBuilder(store)
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

    if (!Ember.isNone(customFilter) && !Ember.isNone(filter)) {
      return new Query.ComplexPredicate(Query.Condition.And, filter, customFilter);
    }

    return customFilter || filter;
  },

  /**
    Handles 'flexberry-map:getLayerFeatures' event of leaflet map.

    @method getLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  getLayerFeatures(e) {
    return new Promise((resolve, reject) => {
      try {
        const leafletObject = this.get('_leafletObject');
        const { featureIds, } = e;
        if (!leafletObject.options.showExisting) {
          const obj = this.get('_adapterStoreModelProjectionGeom');

          const getLoadedFeatures = (loadedModels) => {
            let models = loadedModels;
            if (typeof loadedModels.toArray === 'function') {
              models = loadedModels.toArray();
            }

            const result = [];
            models.forEach((model) => {
              result.push(this.addLayerObject(leafletObject, model, false));
            });

            return result;
          };

          if (isArray(featureIds) && !isNone(featureIds)) {
            const equals = A();
            featureIds.forEach((id) => {
              equals.pushObject(new SimplePredicate('id', FilterOperator.Eq, id));
            });

            const queryBuilder = new QueryBuilder(obj.store)
              .from(obj.modelName)
              .selectByProjection(obj.projectionName);

            if (equals.length === 1) {
              queryBuilder.where(this.addCustomFilter(equals[0]));
            } else {
              queryBuilder.where(this.addCustomFilter(new ComplexPredicate(Condition.Or, ...equals)));
            }

            const objs = obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store);

            objs.then((res) => {
              resolve(getLoadedFeatures(res));
            }).catch((e) => {
              reject('error');
            });
          } else { // all layer
            this.getCountFeatures().then((res) => {
              const promises = A();
              let count = res;
              let skip = 0;
              do {
                const queryBuilder = new QueryBuilder(obj.store)
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
                const queryBuilder = new QueryBuilder(obj.store)
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

              all(promises).then((res) => {
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
        } else if (isArray(featureIds) && !isNone(featureIds)) {
          const objects = [];
          featureIds.forEach((id) => {
            const features = leafletObject._layers;
            const obj = Object.values(features).find((feature) => this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), feature) === id);
            if (!isNone(obj)) {
              objects.push(obj);
            }
          });
          resolve(objects);
        } else {
          resolve(Object.values(leafletObject._layers));
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

    if (!isNone(leafletObject)) {
      // it's from api showAllLayerObjects, to load objects if layer is not visibility
      const showLayerObjects = (!isNone(leafletObject.showLayerObjects) && leafletObject.showLayerObjects);
      const show = this.get('visibility');
      const continueLoad = !leafletObject.options.showExisting && leafletObject.options.continueLoading;
      const showExisting = leafletObject.options.showExisting && !leafletObject.options.continueLoading && isEmpty(Object.values(leafletObject._layers));

      let promise;

      if ((continueLoad && show && checkMapZoom(leafletObject)) || (showLayerObjects && continueLoad)) {
        let loadedBounds = this.get('loadedBounds');
        const leafletMap = this.get('leafletMap');
        const obj = this.get('_adapterStoreModelProjectionGeom');
        const bounds = L.rectangle(leafletMap.getBounds());
        if (!isNone(leafletObject.showLayerObjects)) {
          leafletObject.showLayerObjects = false;
        }

        let oldPart;
        if (!isNone(loadedBounds)) {
          if (loadedBounds instanceof L.LatLngBounds) {
            loadedBounds = L.rectangle(loadedBounds);
          }

          const loadedBoundsJsts = loadedBounds.toJsts(L.CRS.EPSG4326);
          const boundsJsts = bounds.toJsts(L.CRS.EPSG4326);

          if (loadedBoundsJsts.contains(boundsJsts)) {
            if (leafletObject.statusLoadLayer) {
              leafletObject.promiseLoadLayer = resolve();
            }

            return resolve('Features in bounds is already loaded');
          }

          const queryOldBounds = new GeometryPredicate(obj.geometryField);
          oldPart = new NotPredicate(queryOldBounds.intersects(loadedBounds.toEWKT(this.get('crs'))));

          const unionJsts = loadedBoundsJsts.union(boundsJsts);
          const geojsonWriter = new jsts.io.GeoJSONWriter();
          loadedBounds = L.geoJSON(geojsonWriter.write(unionJsts)).getLayers()[0];
        } else {
          loadedBounds = bounds;
        }

        this.set('loadedBounds', loadedBounds);

        const queryNewBounds = new GeometryPredicate(obj.geometryField);
        const newPart = queryNewBounds.intersects(loadedBounds.toEWKT(this.get('crs')));
        let filter = oldPart ? new ComplexPredicate(Condition.And, oldPart, newPart) : newPart;
        const layerFilter = this.get('filter');
        filter = isEmpty(layerFilter) ? filter : new ComplexPredicate(Condition.And, filter, layerFilter);

        promise = this._downloadFeaturesWithOrNotFilter(leafletObject, obj, filter);
      } else if (showExisting || (showExisting && showLayerObjects)) {
        promise = this._downloadFeaturesWithOrNotFilter(leafletObject, this.get('_adapterStoreModelProjectionGeom'));
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

  _downloadFeaturesWithOrNotFilter(leafletObject, obj, filter) {
    const queryBuilder = new QueryBuilder(obj.store)
      .from(obj.modelName)
      .selectByProjection(obj.projectionName);

    filter = this.addCustomFilter(filter);
    if (!isNone(filter)) {
      queryBuilder.where(filter);
    }

    const objs = obj.adapter.batchLoadModel(obj.modelName, queryBuilder.build(), obj.store);

    const promise = new Promise((resolve, reject) => {
      objs.then((res) => {
        let models = res;
        if (typeof res.toArray === 'function') {
          models = res.toArray();
        }

        const innerLayers = [];
        models.forEach((model) => {
          const l = this.addLayerObject(leafletObject, model, false);
          innerLayers.push(l);
        });

        const e = { layers: innerLayers, results: A(), };
        leafletObject.fire('load', e);

        allSettled(e.results).then(() => {
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

    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
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
    leafletObject.models
      .filter((layer) => isNone(ids) || ids.contains(leafletObject.getLayerId(layer))).forEach((model, layerId) => {
        const layer = leafletObject.getLayer(layerId);
        const dirtyType = model.get('dirtyType');
        if (dirtyType === 'created') {
          if (leafletObject.hasLayer(layer)) {
            leafletObject.removeLayer(layer);
          }

          delete leafletObject.models[layerId];
          if (editTools.featuresLayer.getLayers().length !== 0) {
            const editorLayerId = editTools.featuresLayer.getLayerId(layer);
            const featureLayer = editTools.featuresLayer.getLayer(editorLayerId);
            if (!isNone(editorLayerId) && !isNone(featureLayer) && !isNone(featureLayer.editor)) {
              const { editLayer, } = featureLayer.editor;
              editTools.editLayer.removeLayer(editLayer);
              editTools.featuresLayer.removeLayer(layer);
            }
          }
        } else if (dirtyType === 'updated' || dirtyType === 'deleted') {
          if (!isNone(layer)) {
            if (!isNone(layer.editor)) {
              const { editLayer, } = layer.editor;
              editTools.editLayer.removeLayer(editLayer);
            }

            if (leafletObject.hasLayer(layer)) {
              leafletObject.removeLayer(layer);
            }
          }

          model.rollbackAttributes();
          delete leafletObject.models[layerId];
          featuresIds.push(model.get('id'));
        }
      });
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
    return new Promise((resolve, reject) => {
      const obj = this.get('_adapterStoreModelProjectionGeom');
      const layerModel = this.get('layerModel');
      const config = getOwner(this).resolveRegistration('config:environment');
      const mapApi = this.get('mapApi').getFromApi('mapModel');
      const _this = this;
      $.ajax({
        url: `${layerModel.get('_leafletObject.options.metadataUrl') + layerModel.get('_leafletObject.modelName')}.json`,
        success(dataClass) {
          const odataQueryName = Ember.String.pluralize(capitalize(camelize(dataClass.modelName)));
          const odataUrl = _this.get('odataUrl');
          obj.adapter.callAction(
            config.APP.backendActions.getNearDistance,
            {
              geom: L.marker(mapApi.getObjectCenter(e.featureLayer)).toEWKT(_this.get('crs')),
              odataQueryName,
              odataProjectionName: obj.projectionName,
            },
            odataUrl,
            null,
            (data) => {
              new Promise((resolve) => {
                const normalizedRecords = { data: A(), included: A(), };
                const odataValue = data.value;
                if (!isNone(odataValue) && Array.isArray(odataValue)) {
                  odataValue.forEach((record) => {
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

                resolve(run(obj.store, obj.store.push, normalizedRecords));
              }).then((result) => {
                const features = A();
                let models = result;
                if (typeof result.toArray === 'function') {
                  models = result.toArray();
                }

                const layer = L.featureGroup();

                models.forEach((model) => {
                  const feat = _this.addLayerObject(layer, model, false);
                  features.push(feat.feature);
                });

                const distance = mapApi._getDistanceBetweenObjects(e.featureLayer, features[0].leafletLayer);
                resolve({
                  distance,
                  layer: layerModel,
                  object: features[0].leafletLayer,
                });
              });
            },
            (message) => {
              reject(message);
            }
          );
        },
      });
    });
  },
});
