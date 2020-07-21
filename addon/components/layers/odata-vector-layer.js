/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import { Query } from 'ember-flexberry-data';
import { checkMapZoomLayer, checkMapZoom } from '../../utils/check-zoom';
import state from '../../utils/state';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import jsts from 'npm:jsts';
import wkt from 'npm:@terraformer/wkt';
const { Builder } = Query;

/**
  Investment layer component for leaflet map.

  @class ODataVectorLayerComponent
  @extends BaseVectorLayer
 */
export default BaseVectorLayer.extend({

  leafletOptions: ['attribution', 'pane', 'styles'],

  clusterize: false,

  store: Ember.inject.service(),

  postfixForEditForm: '-e',

  /**
    Saves layer changes.

    @method save
  */
  save() {
    let _this = this;
    let leafletObject = _this.get('_leafletObject');
    leafletObject.eachLayer(function (layer) {
      if (Ember.get(layer, 'model.hasDirtyAttributes')) {
        if (layer.state === state.insert) {
          const geometryField = _this.get('geometryField') || 'geometry';
          let geometryObject = Ember.A();
          let coordinates = Ember.A();
          let type = Ember.get(layer, 'feature.geometry.type');
          if (layer instanceof L.Marker) {
            coordinates = _this.transformToCoords(layer._latlng);
          } else {
            coordinates = _this.transformToCoords(layer._latlngs, type);
          }

          if (_this.get('forceMulti') && (layer.toGeoJSON().geometry.type === 'Polygon' || layer.toGeoJSON().geometry.type === 'LineString')) {
            geometryObject = [coordinates];
          } else {
            geometryObject = coordinates;
          }

          Ember.set(layer, 'feature.geometry.coordinates', geometryObject);
        }
      }
    }, leafletObject);

    let modelsLayer = leafletObject.models;
    const store = this.get('store');
    if (modelsLayer.length > 0) {
      let insertedIds = leafletObject.getLayers().map((layer) => {
        if (layer.state === state.insert) {
          return layer.feature.properties.primarykey;
        }
      });
      let insertedLayer = leafletObject.getLayers().filter(layer => {
        return layer.state === state.insert;
      });

      store.batchUpdate(modelsLayer).then((models) => {
        modelsLayer.clear();
        let insertedModelId = [];

        models.forEach(model => {
          let ids = insertedIds.filter(id => {
            return model.get('id') === id;
          });
          if (ids.length > 0) {
            insertedModelId.push(ids[0]);
          }
        });

        insertedLayer.forEach(function (layer) {
          L.FeatureGroup.prototype.removeLayer.call(leafletObject, layer);
        });

        if (insertedModelId.length > 0) {
          _this.get('mapApi').getFromApi('mapModel')._getModelLayerFeature(_this.layerModel.get('id'), insertedModelId, true)
          .then(([, lObject, featureLayer]) => {
            _this._setLayerState();
            leafletObject.fire('save:success', { layers: featureLayer });
          });
        } else {
          leafletObject.fire('save:success', { layers: [] });
        }
      }).catch(function (e) {
        console.log('Error save: ' + e);
        leafletObject.fire('save:failed', e);
      });
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
  },

  /**
    Add layer in model.

    @method addLayer
    @param layer
  */
  addLayer(layer) {
    const model = this.get('store').createRecord(this.get('modelName'), layer.feature.properties || {});
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
    let leafletObject = this.get('_leafletObject');
    L.FeatureGroup.prototype.addLayer.call(leafletObject, layer);
    var id = leafletObject.getLayerId(layer);
    leafletObject.models[id] = layer.model;
    return leafletObject;
  },

  /**
    Get geometry from layer in ewkt array

    @method _getGeometry
    @param {Object} layer
  */
  _getGeometry(layer) {
    let coordinates = Ember.A();
    let type = layer.toGeoJSON().geometry.type;
    if (layer instanceof L.Marker) {
      coordinates = this.transformToCoords(layer._latlng);
    } else {
      coordinates = this.transformToCoords(layer._latlngs, type);
    }

    if (this.get('forceMulti') && (type === 'Polygon' || type === 'LineString')) {
      return [coordinates];
    } else {
      return coordinates;
    }
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
      has: function(target, prop) {
        return target.has(prop);
      },
    });

    layer.feature.id = this.get('modelName') + '.' + layer.feature.properties.primarykey;
    layer.leafletMap = this.get('leafletMap');

    let pane = this.get('_pane');
    if (pane) {
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
      let obj = this.get('_buildStoreModelProjectionGeom');

      if (!Ember.isNone(maxFeatures)) {
        obj.build.top = maxFeatures;
      }

      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let intersectionArea = config.APP.intersectionArea;
      if (isIdentify && obj.build.select.indexOf(intersectionArea) === -1) {
        obj.build.select.push(intersectionArea);
      }

      obj.build.predicate = filter;
      let objs = obj.adapter.batchLoadModel(obj.modelName, obj.build, obj.store);
      objs.then(res => {
        if (isIdentify && obj.build.select.indexOf(intersectionArea) > 0) {
          obj.build.select.pop();
        }

        let features = Ember.A();
        let models = res.toArray();
        let layer = L.featureGroup();

        models.forEach(model => {
          let feat = this.addLayerObject(layer, model, false);
          features.push(feat.feature);
        });

        resolve(features);
      }).catch((e) => {
        reject(e.error || e);
      });
    });
  },

  /**
    Transform geometry to EWKT format

    @method geomToEWKT
    @param {Object} layer layer
    @param {Boolean} CRS4326
    @returns {String} geometry as EWKT format.
  */
  geomToEWKT(layer, CRS4326 = false) {
    let coordInCrs;
    let geojson;
    let crs;
    if (!CRS4326) {
      coordInCrs = this._getGeometry(layer);
      let type = layer.toGeoJSON().geometry.type;
      if (this.get('forceMulti')) {
        switch (type) {
          case 'Polygon':
            type = 'MultiPolygon';
            break;
          case 'LineString':
            type = 'MultiLineString';
            break;
        }
      }

      geojson = {
        'type': type,
        'coordinates': coordInCrs
      };
      crs = this.get('crs').code.split(':')[1];
    } else {
      geojson = layer.toGeoJSON().geometry;
      crs = '4326';
    }

    let coordToWkt = wkt.geojsonToWKT(geojson);
    return `SRID=${crs};${coordToWkt}`;
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
    let predicate = pred.intersects(this.geomToEWKT(e.polygonLayer));
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
      if (!Ember.isBlank(type)) {
        let layerClass = Ember.getOwner(this).knownForType('layer', type);
        let layerProperties = layerClass.getLayerProperties(leafletObject);
        searchFields.forEach((field) => {
          let ind = layerProperties.indexOf(field);
          if (ind > -1) {
            let layerPropertyType = typeof layerClass.getLayerPropertyValues(leafletObject, layerProperties[ind], 1)[0];
            let layerPropertyValue = layerClass.getLayerPropertyValues(leafletObject, layerProperties[ind], 1)[0];
            if (layerPropertyType !== 'string' || (layerPropertyType === 'object' && layerPropertyValue instanceof Date)) {
              equals.push(new Query.SimplePredicate(field, Query.FilterOperator.Eq, e.searchOptions.queryString));
            } else {
              equals.push(new Query.StringPredicate(field).contains(e.searchOptions.queryString));
            }
          }
        });
      }
    }

    let filter;
    if (equals.length === 1) {
      filter = equals[0];
    } else {
      filter = new Query.ComplexPredicate(Query.Condition.Or, ...equals);
    }

    let featuresPromise = this._getFeature(filter, e.searchOptions.maxResultsCount);

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
      console.log('No geometry specified for layer');
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
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let obj = this.get('_buildStoreModelProjectionGeom');
      let crs = this.get('crs');

      let visibility = this.get('layerModel.visibility');
      let bounds = L.rectangle(this.get('leafletMap').getBounds());
      let continueLoading = this.get('continueLoading');
      let showExisting = this.get('showExisting');
      if (!showExisting && continueLoading && visibility && checkMapZoomLayer(this)) {
        let query = new Query.GeometryPredicate(obj.geometryField);
        obj.build.predicate = query.intersects(this.geomToEWKT(bounds));
      } else {
        // Fake request
        obj.build.predicate = new Query.SimplePredicate('id', Query.FilterOperator.Eq, null);
      }

      let objs = obj.adapter.batchLoadModel(obj.modelName, obj.build, obj.store);

      objs.then(res => {
        const options = this.get('options');
        let models = res.toArray();
        let layer = L.featureGroup();

        layer.options.crs = crs;
        layer.options.style = this.get('styleSettings');
        layer.options.continueLoading = continueLoading;
        layer.options.showExisting = showExisting;
        if (!showExisting && continueLoading && visibility && checkMapZoomLayer(this)) {
          layer.isLoadBounds = bounds;
        }

        L.setOptions(layer, options);
        layer.minZoom = this.get('minZoom');
        layer.maxZoom = this.get('maxZoom');
        layer.save = this.get('save').bind(this);
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

        models.forEach(model => {
          this.addLayerObject(layer, model);
        });

        this._setLayerState();
        let promiseLoad = Ember.RSVP.resolve();
        this.set('promiseLoad', promiseLoad);

        resolve(layer);
      }).catch((e) => {
        reject(e);
      });
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

  /**
   Projects geometry from latlng to coords.

   @method transformToCoords
   @param {Leaflet Object} latlngs
   @param {String} type
   @returns coordinates in GeoJSON
   */
  transformToCoords(latlngs, type) {
    if (Array.isArray(latlngs[0]) || (!(latlngs instanceof L.LatLng) && (latlngs[0] instanceof L.LatLng))) {
      let coords = [];
      for (let i = 0; i < latlngs.length; i++) {
        coords.push(this.transformToCoords(latlngs[i], type));
      }

      // ewkt requires closeing polygon
      if (!Ember.isNone(type) && type.indexOf('Polygon') !== -1 && !Array.isArray(coords[0][0])) {
        let first = coords[0];
        coords.push(first);
      }

      return coords;
    }

    const crs = this.get('crs');
    const latLng = latlngs instanceof L.LatLng ? latlngs : L.latLng(latlngs[1], latlngs[0]);
    const point = crs.project(latLng);
    return [point.x, point.y];
  },

  createReadFormat() {
    let readFormat = this._super(...arguments);
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
      Ember.set(attributesOptions, 'settings.readonly', this.get('readonly') || false);
      Ember.set(attributesOptions, 'settings.excludedProperties', Ember.A(['syncDownTime', 'readOnly', 'creator', 'editor', 'createTime', 'editTime']));
      return attributesOptions;
    });
  },

  _buildStoreModelProjectionGeom: Ember.computed('modelName', 'projectionName', 'geometryField', 'store', function () {
    const modelName = this.get('modelName');
    const projectionName = this.get('projectionName');
    const geometryField = this.get('geometryField') || 'geometry';
    const store = this.get('store');
    const adapter = Ember.getOwner(this).lookup('adapter:application');

    if (!modelName) {
      return;
    }

    let builder = new Builder(store)
      .from(modelName)
      .selectByProjection(projectionName);
    return {
      build: builder.build(),
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
                if (featureIds.includes(id)) {
                  equals.pushObject(new Query.SimplePredicate('id', Query.FilterOperator.Eq, id));
                }
              });

              if (equals.length === 1) {
                return equals[0];
              } else {
                return new Query.ComplexPredicate(Query.Condition.Or, ...equals);
              }
            }

            return null;
          };

          let obj = this.get('_buildStoreModelProjectionGeom');
          obj.build.predicate = null;
          if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {// load features by id
            let loadIds = getLoadedFeatures(featureIds);

            let remainingFeat = featureIds.filter((item) => {
              return loadIds.indexOf(item) === -1;
            });

            if (!Ember.isEmpty(remainingFeat)) {
              obj.build.predicate = makeFilterEqOr(remainingFeat);
            } else { // If objects is already loaded, return leafletObject
              resolve(leafletObject);
              return;
            }
          } else {// load objects that don't exist yet
            let alreadyLoaded = getLoadedFeatures(null);
            let filterEqOr = makeFilterEqOr(alreadyLoaded);
            if (!Ember.isNone(filterEqOr)) {
              obj.build.predicate = new Query.NotPredicate(makeFilterEqOr(alreadyLoaded));
            }
          }

          let objs = obj.adapter.batchLoadModel(obj.modelName, obj.build, obj.store);

          objs.then(res => {
            let models = res.toArray();
            models.forEach(model => {
              this.addLayerObject(leafletObject, model);
            });
            this._setLayerState();
            resolve(leafletObject);
          });
        } else {
          resolve(leafletObject);
        }
      } catch (e) {
        console.log(e);
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
      try {
        let leafletObject = this.get('_leafletObject');
        let featureIds = e.featureIds;
        if (!leafletObject.options.showExisting) {
          let obj = this.get('_buildStoreModelProjectionGeom');
          obj.build.predicate = null;

          if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
            let equals = Ember.A();
            featureIds.forEach((id) => {
              equals.pushObject(new Query.SimplePredicate('id', Query.FilterOperator.Eq, id));
            });

            if (equals.length === 1) {
              obj.build.predicate = equals[0];
            } else {
              obj.build.predicate = new Query.ComplexPredicate(Query.Condition.Or, ...equals);
            }
          }

          let objs = obj.adapter.batchLoadModel(obj.modelName, obj.build, obj.store);

          objs.then(res => {
            let models = res.toArray();
            let result = [];
            models.forEach(model => {
              result.push(this.addLayerObject(leafletObject, model, false));
            });
            resolve(result);
          }).catch((e) => {
            reject('error');
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
      } catch (e) {
        console.log(e);
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
          let notContinueLoad = leafletObject.options.showExisting === false && leafletObject.options.continueLoading === false;
          if (continueLoad && show && checkMapZoom(leafletObject)) {
            let bounds = L.rectangle(leafletMap.getBounds());
            if (!Ember.isNone(leafletObject.showLayerObjects)) {
              leafletObject.showLayerObjects = false;
            }

            let obj = this.get('_buildStoreModelProjectionGeom');

            obj.build.predicate = null;
            let crs = this.get('crs');
            let geojsonReader = new jsts.io.GeoJSONReader();
            if (loadedBounds instanceof L.LatLngBounds) {
              loadedBounds = L.rectangle(loadedBounds);
            }

            let loadedBoundsJsts = geojsonReader.read(loadedBounds.toGeoJSON().geometry);
            let boundsJsts = geojsonReader.read(bounds.toGeoJSON().geometry);

            if (Ember.isNone(leafletObject.isLoadBounds)) {
              let query = new Query.GeometryPredicate(obj.geometryField);
              obj.build.predicate = query.intersects(this.geomToEWKT(bounds));
              leafletObject.isLoadBounds = bounds;
              loadedBounds = bounds;
              let objs = obj.adapter.batchLoadModel(obj.modelName, obj.build, obj.store);
              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = objs;
              }

              objs.then(res => {
                let models = res.toArray();
                models.forEach(model => {
                  this.addLayerObject(leafletObject, model);
                });
                this._setLayerState();
              });
              return;
            } else if (loadedBoundsJsts.contains(boundsJsts)) {
              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
              }

              return;
            }

            let queryOldBounds = new Query.GeometryPredicate(obj.geometryField);
            let oldPart = new Query.NotPredicate(queryOldBounds.intersects(this.geomToEWKT(loadedBounds)));

            let unionJsts = loadedBoundsJsts.union(boundsJsts);
            let geojsonWriter = new jsts.io.GeoJSONWriter();
            loadedBounds = L.geoJSON(geojsonWriter.write(unionJsts)).getLayers()[0];
            let queryNewBounds = new Query.GeometryPredicate(obj.geometryField);
            let newPart = queryNewBounds.intersects(this.geomToEWKT(loadedBounds));

            obj.build.predicate = new Query.ComplexPredicate(Query.Condition.And, oldPart, newPart);
            let objs = obj.adapter.batchLoadModel(obj.modelName, obj.build, obj.store);
            if (leafletObject.statusLoadLayer) {
              leafletObject.promiseLoadLayer = objs;
            }

            objs.then(res => {
              let models = res.toArray();
              models.forEach(model => {
                this.addLayerObject(leafletObject, model);
              });
              this._setLayerState();
            });
          } else if (notContinueLoad && this.get('layerModel.visibility') && Ember.isNone(leafletObject.isLoaded)) {// loaded for not ContinueLoad
            leafletObject.isLoaded = true;
            let e = {
              featureIds: null,
              layer: this.get('layerModel.id'),
              load: true,
              results: Ember.A()
            };
            this.loadLayerFeatures(e);
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
