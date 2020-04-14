/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import { Query } from 'ember-flexberry-data';
import { checkMapZoomLayer, checkMapZoom } from '../../utils/check-zoom';
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
    const promises = Ember.A();
    let leafletObject = _this.get('_leafletObject');
    leafletObject.eachLayer(function(layer) {
      if (Ember.get(layer, 'model.hasDirtyAttributes')) {
        if (layer.state === leafletObject.state.insert) {
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

        promises.addObject(layer.model.save());
      }
    }, leafletObject);

    leafletObject.deletedModels.forEach(model => {
      promises.addObject(model.save());
    });

    leafletObject.deletedModels.clear();

    if (promises.length > 0) {
      Ember.RSVP.all(promises).then((e) => {
        console.log('success');
        _this._setLayerState();
        leafletObject.fire('save:success');
      }).catch(function(e) {
        console.log('Error: ' + e);
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
      layer.model.setProperties(layer.feature.properties);
      layer.model.set(geometryField, geometryObject);
      layer.state = leafletObject.state.update;
    }

    return leafletObject;
  },

  /**
    Deletes model in odata layer.

    @method removeLayer
    @param layer
  */
  removeLayer(layer) {
    L.FeatureGroup.prototype.removeLayer.call(this, layer);
    if (layer.state === this.state.remove) {
      layer.model.deleteRecord();
      layer.model.set('hasChanged', true);
      layer.state = this.state.remove;
      this.deletedModels.addObject(layer.model);
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
    let leafletObject = this.get('_leafletObject');
    layer.state = leafletObject.state.insert;
    this._setLayerProperties(layer, model, geometryObject, leafletObject);
    L.FeatureGroup.prototype.addLayer.call(leafletObject, layer);
    return leafletObject;
  },

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

  _setLayerProperties(layer, model, geometry, leafletObject) {
    const modelProj = model.constructor.projections.get(this.get('projectionName'));
    layer.options.crs = this.get('crs');
    layer.model = model;
    layer.modelProj = modelProj;
    layer.feature = {
      type: 'Feature',
      geometry: geometry,
      leafletLayer: layer
    };
    if (layer.state = leafletObject.state.update) {
      layer.feature.properties = this.createPropsFromModel(model);
    }

    if (geometry.type === 'Point') {
      layer.options.style = this.get('style');
    } else {
      layer.options.style = this.get('styleSettings.style.path');
    }
  },

  _getFeature(filter, maxFeatures) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let [build, store, modelName] = this._getBuildStoreModelProjectionGeom();

      if (!Ember.isNone(maxFeatures)) {
        build.top = maxFeatures;
      }

      build.predicate = filter;
      let objs = store.query(modelName, build);
      objs.then(res => {
        let features = Ember.A();
        let models = res.toArray();
        let layer = L.featureGroup();
        layer.state = {
          exist: 'exist',
          insert: 'insertElement',
          update: 'updateElement',
          remove: 'removeElement'
        };

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
    Handles 'flexberry-map:identify' event of leaflet map.
    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} polygonLayer Polygon layer related to given area.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
  **/
  identify(e) {
    let geometryField = this.get('geometryField') || 'geometry';
    let crs = this.get('crs');
    let pred = new Query.GeometryPredicate(geometryField);
    let geom = '';
    let typeGeom;

    let row = function(geom, typeGeom) {
      let coord0 = '';
      let queryStr = '(';
      geom.forEach((item) => {
        if (typeGeom.indexOf('POLYGON') !== -1 && Ember.isEmpty(coord0)) {
          coord0 = ', ' + crs.project(item).x + ' ' + crs.project(item).y;
        }

        queryStr += crs.project(item).x + ' ' + crs.project(item).y + ', ';
      });

      queryStr = queryStr.slice(0, queryStr.length - 2);
      queryStr += coord0 + ')';
      return queryStr;
    };

    if (e.polygonLayer instanceof L.Marker) {
      typeGeom = 'POINT';
      geom = row([e.polygonLayer._latlng], typeGeom);
    } else if (e.polygonLayer instanceof L.Polygon) {
      let count1 = e.polygonLayer._latlngs.length;
      for (let i = 0; i < count1; i++) {
        geom += '(';
        let count2 = e.polygonLayer._latlngs[i].length;
        for (let j = 0; j < count2; j++) {
          let item = e.polygonLayer._latlngs[i][j];
          if (!Ember.isNone(item.length)) {
            typeGeom = 'MULTIPOLYGON';
            geom += '(';
            geom += row(item, typeGeom);
            geom += ')';
            if (j !== count2 - 1) {
              geom += ',';
            }
          } else {
            typeGeom = 'POLYGON';
            break;
          }
        }

        if (typeGeom === 'POLYGON') {
          geom += row(e.polygonLayer._latlngs[i], typeGeom);
          if (i !== count1 - 1) {
            geom += ',';
          }
        }

        geom += ')';
      }
    } else {
      if (Ember.isArray(e.polygonLayer._latlngs[0])) {
        typeGeom = 'MULTILINESTRING';
        geom += '(';
        let count1 = e.polygonLayer._latlngs.length;
        for (let i = 0; i < count1; i++) {
          geom += row(e.polygonLayer._latlngs[i], typeGeom);
          if (i !== count1 - 1) {
            geom += ',';
          }
        }

        geom += ')';
      } else {
        typeGeom = 'LINESTRING';
        geom = row(e.polygonLayer._latlngs, typeGeom);
      }
    }

    let queryStr = `SRID=${crs.code.split(':')[1]};${typeGeom}${geom}`;
    let predicate = pred.intersects(queryStr);
    let featuresPromise = this._getFeature(predicate);
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
              propertyEquals.pushObject(new Query.SimplePredicate(property, Query.FilterOperator.Eq, value));
            });

            equals.pushObject(new Query.ComplexPredicate(Query.Condition.Or, ...propertyEquals));
          } else {
            equals.pushObject(new Query.SimplePredicate(property, Query.FilterOperator.Eq, propertyValue));
          }
        });
      }
    });

    let filter;
    if (equals.length === 1) {
      filter = equals[0];
    } else {
      filter = new Query.ComplexPredicate(Query.Condition.And, ...equals);
    }

    let featuresPromise = this._getFeature(filter);

    return featuresPromise;
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
      innerLayer.state = layer.state.exist;
      this._setLayerProperties(innerLayer, model, geometry, layer);
      if (add) {
        innerLayer.setStyle(innerLayer.options.style);
        this._setLayerState();
        L.FeatureGroup.prototype.addLayer.call(layer, innerLayer);
      }
    }

    return innerLayer;
  },

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
      let [build, store, modelName, geometryField, projectionName] = this._getBuildStoreModelProjectionGeom();
      let crs = this.get('crs');

      let visibility = this.get('layerModel.visibility');
      let bounds = this.get('leafletMap').getBounds();
      if (this.get('continueLoading') && visibility && checkMapZoomLayer(this)) {
        build.predicate = this._getGeomPredicateFromBounds(geometryField, crs, bounds);
      } else if (this.get('continueLoading')) {
        // Fake request
        build.predicate = new Query.SimplePredicate('id', Query.FilterOperator.Eq, null);
      }

      let objs = store.query(modelName, build);

      objs.then(res => {
        const options = this.get('options');
        let models = res.toArray();
        let layer = L.featureGroup();

        layer.options.crs = crs;
        layer.options.style = this.get('styleSettings');
        layer.options.continueLoading = this.get('continueLoading');
        if (layer.options.continueLoading && visibility && checkMapZoomLayer(this)) {
          layer.isLoadBounds = bounds;
        }

        L.setOptions(layer, options);
        layer.state = {
          exist: 'exist',
          insert: 'insertElement',
          update: 'updateElement',
          remove: 'removeElement'
        };

        layer.save = this.get('save').bind(this);
        layer.geometryField = geometryField;
        layer.addLayer = this.get('addLayer').bind(this);
        layer.editLayerObjectProperties = this.get('editLayerObjectProperties').bind(this);
        layer.editLayer = this.get('editLayer').bind(this);
        layer.removeLayer = this.get('removeLayer');
        layer.modelName = modelName;
        layer.projectionName = projectionName;
        layer.editformname = modelName + this.get('postfixForEditForm');
        layer.deletedModels = Ember.A();
        layer.loadLayerFeatures = this.get('loadLayerFeatures').bind(this);
        models.forEach(model => {
          this.addLayerObject(layer, model);
        });

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

  /**
   Creates object to be showed in attribute panel

   @method createPropsFromModel
   @param {Ember.Model} model feature's model
   */
  createPropsFromModel(model) {
    let props = {};
    for (let prop in model.toJSON()) {
      let postfix = '';
      if (model.get(prop) instanceof Object && model.get(`${prop}.name`)) {
        postfix = '.name';
      }

      props[prop] = model.get(`${prop}${postfix}`);
    }

    props.primarykey = Ember.get(model, 'id');
    return props;
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

  _getBuildStoreModelProjectionGeom() {
    const modelName = this.get('modelName');
    const projectionName = this.get('projectionName');
    const geometryField = this.get('geometryField') || 'geometry';
    const store = this.get('store');

    if (!modelName) {
      return;
    }

    let builder = new Builder(store)
      .from(modelName)
      .selectByProjection(projectionName);
    return [builder.build(), store, modelName, geometryField, projectionName];
  },

  /**
    Get geometry predicate from bounds

    @method _getGeomPredicateFromBounds
    @param {geometryField}
    @param {crs}
    @param {bounds}
  */
  _getGeomPredicateFromBounds(geometryField, crs, bounds) {
    let query = new Query.GeometryPredicate(geometryField);
    let nw = crs.project(bounds.getNorthWest());
    let ne = crs.project(bounds.getNorthEast());
    let se = crs.project(bounds.getSouthEast());
    let sw = crs.project(bounds.getSouthWest());
    return query.intersects(`SRID=${crs.code.split(':')[1]};POLYGON((${nw.x} ${nw.y}, ${ne.x} ${ne.y}, ${se.x} ${se.y}, ${sw.x} ${sw.y}, ${nw.x} ${nw.y}))`);
  },

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
        if (leafletObject.options.continueLoading) {
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

            let [build, store, modelName] = this._getBuildStoreModelProjectionGeom();
            if (!Ember.isNone(remainingFeat)) {
              let equals = Ember.A();
              remainingFeat.forEach((id) => {
                if (featureIds.includes(id)) {
                  equals.pushObject(new Query.SimplePredicate('id', Query.FilterOperator.Eq, id));
                }
              });

              if (equals.length === 1) {
                build.predicate = equals[0];
              } else {
                build.predicate = new Query.ComplexPredicate(Query.Condition.Or, ...equals);
              }
            }

            let objs = store.query(modelName, build);

            objs.then(res => {
              let models = res.toArray();
              models.forEach(model => {
                this.addLayerObject(leafletObject, model);
              });
              resolve(leafletObject);
            });
          } else {
            resolve(leafletObject);
          }
        } else {
          resolve(leafletObject);
        }
      } catch (e) {}
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
        if (leafletObject.options.continueLoading) {
          let [build, store, modelName] = this._getBuildStoreModelProjectionGeom();
          if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
            let equals = Ember.A();
            featureIds.forEach((id) => {
              equals.pushObject(new Query.SimplePredicate('id', Query.FilterOperator.Eq, id));
            });

            if (equals.length === 1) {
              build.predicate = equals[0];
            } else {
              build.predicate = new Query.ComplexPredicate(Query.Condition.Or, ...equals);
            }

            let objs = store.query(modelName, build);

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
      } catch (e) {}
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
          let continueLoad = leafletObject.options.continueLoading;
          if (continueLoad && checkMapZoom(leafletObject) && show) {
            let bounds = leafletMap.getBounds();
            if (!Ember.isNone(leafletObject.showLayerObjects)) {
              leafletObject.showLayerObjects = false;
            }

            let [build, store, modelName, geometryField] = this._getBuildStoreModelProjectionGeom();
            let crs = this.get('crs');

            if (Ember.isNone(leafletObject.isLoadBounds)) {
              build.predicate = this._getGeomPredicateFromBounds(geometryField, crs, bounds);
              leafletObject.isLoadBounds = bounds;
              loadedBounds = bounds;
              let objs = store.query(modelName, build);
              objs.then(res => {
                let models = res.toArray();
                models.forEach(model => {
                  this.addLayerObject(leafletObject, model);
                });

                if (leafletObject.statusLoadLayer) {
                  leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
                }
              });
              return;
            } else if (loadedBounds.contains(bounds)) {
              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
              }

              return;
            }

            let loadedPart = new Query.NotPredicate(this._getGeomPredicateFromBounds(geometryField, crs, loadedBounds));

            loadedBounds.extend(bounds);
            let newPart = this._getGeomPredicateFromBounds(geometryField, crs, loadedBounds);

            build.predicate = new Query.ComplexPredicate(Query.Condition.And, loadedPart, newPart);

            let objs = store.query(modelName, build);

            objs.then(res => {
              let models = res.toArray();
              models.forEach(model => {
                this.addLayerObject(leafletObject, model);
              });

              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
              }
            });
          } else if (leafletObject.statusLoadLayer) {
            leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
          }
        }
      };

      leafletMap.on('moveend', continueLoad);
    }
  }
});