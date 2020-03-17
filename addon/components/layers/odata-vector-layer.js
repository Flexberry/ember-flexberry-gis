/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import { Query } from 'ember-flexberry-data';
import { GeometryPredicate, NotPredicate, ComplexPredicate, SimplePredicate } from 'ember-flexberry-data/query/predicate';
import { Condition } from 'ember-flexberry-data/query/condition';
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
    const promises = Ember.A();
    this.eachLayer(function(layer) {
      if (Ember.get(layer, 'model.hasDirtyAttributes')) {
        promises.addObject(layer.model.save());
      }
    }, this);

    this.deletedModels.forEach(model => {
      promises.addObject(model.save());
    });

    this.deletedModels.clear();

    Ember.RSVP.all(promises).then(() => {
      console.log('success');
      this.fire('save:success');
    }).catch(function(r) {
      this.fire('save:failed', r);
    });
    return this;
  },

  /**
    Trigers after layer was edited.

    @method editLayer
    @param layer
  */
  editLayer(layer) {

    return this;
  },

  /**
    Deletes model in odata layer.

    @method deleteModel
    @param model
  */
  deleteModel(model) {
    model.deleteRecord();
    model.set('hasChanged', true);
    this.deletedModels.addObject(model);
  },

  createLayerObject(layer, objectProperties, geometry) {
    if (geometry) {
      const model = this.get('store').createRecord(layer.modelName, objectProperties || {});
      const geometryField = this.get('geometryField') || 'geometry';
      const geometryObject = {};
      geometryObject.coordinates = this.transformToCoords(geometry.coordinates);
      geometryObject.crs = {
        properties: { name: this.get('crs.code') },
        type: 'name'
      };
      geometryObject.type = geometry.type;
      model.set(geometryField, geometryObject);

      return this.addLayerObject(layer, model);
    }
  },

  identify(e) {
    let primitiveSatisfiesBounds = (primitive, bounds) => {
      let satisfiesBounds = false;

      if (typeof primitive.forEach === 'function') {
        primitive.forEach(function (nestedGeometry, index) {
          if (satisfiesBounds) {
            return;
          }

          let nestedPrimitive = this.get(index);
          satisfiesBounds = primitiveSatisfiesBounds(nestedPrimitive, bounds);
        });
      } else {
        satisfiesBounds = primitive.within(bounds) || primitive.intersects(bounds);
      }

      return satisfiesBounds;
    };

    return new Ember.RSVP.Promise((resolve, reject) => {
      try {
        let features = Ember.A();
        let bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());
        let leafletLayer = this.get('_leafletObject');
        leafletLayer.eachLayer(function (layer) {
          let geoLayer = layer.toGeoJSON();
          let primitive = new Terraformer.Primitive(geoLayer.geometry);
          let id = layer.model.id;
          geoLayer.properties.primarykey = id;
          if (primitiveSatisfiesBounds(primitive, bounds)) {
            features.pushObject(geoLayer);
          }
        });

        resolve(features);
      } catch (e) {
        reject(e.error || e);
      }
    });
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
      const modelProj = model.constructor.projections.get(this.get('projectionName'));
      innerLayer.options.crs = this.get('crs');
      innerLayer.model = model;
      innerLayer.modelProj = modelProj;
      innerLayer.feature = {
        type: 'Feature',
        properties: this.createPropsFromModel(model),
        geometry: geometry,
        leafletLayer: innerLayer
      };
      if (typeof (innerLayer.setStyle) === 'function') {
        innerLayer.setStyle(Ember.get(layer, 'leafletObject.options.style'));
      }

      if (add) {
        layer.addLayer(innerLayer);
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
  createVectorLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let [build, store, modelName, projectionName, geometryField] = this._getBuildStoreModelProjectionGeom();
      let crs = this.get('crs');

      let visibility = this.get('layerModel.visibility');
      let bounds = this.get('leafletMap').getBounds();
      if (this.get('continueLoading') && visibility && checkMapZoomLayer(this)) {
        build.predicate = this._getGeomPredicateFromBounds(geometryField, crs, bounds);
      }

      let objs = store.query(modelName, build);

      objs.then(res => {
        const options = this.get('options');
        let models = res.toArray();
        let layer = L.featureGroup();

        layer.options.crs = crs;
        layer.options.continueLoading = this.get('continueLoading');
        if (layer.options.continueLoading && visibility && checkMapZoomLayer(this)) {
          layer.isLoadBounds = bounds;
        }

        L.setOptions(layer, options);

        layer.save = this.get('save');
        layer.geometryField = geometryField;
        layer.createLayerObject = this.get('createLayerObject').bind(this);
        layer.editLayerObjectProperties = this.get('editLayerObjectProperties').bind(this);
        layer.editLayer = this.get('editLayer');
        layer.deleteModel = this.get('deleteModel');
        layer.modelName = modelName;
        layer.projectionName = projectionName;
        layer.editformname = modelName + this.get('postfixForEditForm');
        layer.deletedModels = Ember.A();
        models.forEach(model => {
          this.addLayerObject(layer, model);
        });

        let promiseLoad = new Ember.RSVP.Promise((resolve, reject) => {
          layer.on('load', () => {
            resolve();
          }).on('error', (e) => {
            reject();
          });
        });

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
   @returns coordinates in GeoJSON
   */
  transformToCoords(latlngs) {
    if (Array.isArray(latlngs[0])) {
      let coords = [];
      for (let i = 0; i < latlngs.length; i++) {
        coords.push(this.transformToCoords(latlngs[i]));
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

    props.primarykey = Ember.get(model,'id');
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
    return [builder.build(), store, modelName, projectionName, geometryField];
  },

  /**
    Get geometry predicate from bounds

    @method _getGeomPredicateFromBounds
    @param {geometryField}
    @param {crs}
    @param {bounds}
  */
  _getGeomPredicateFromBounds(geometryField, crs, bounds) {
    let query = new GeometryPredicate(geometryField);
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
              let pkField = this.get('odataPkField');
              if (featureIds.includes(id)) {
                equals.pushObject(new SimplePredicate(pkField, '==', id));
              }
            });

            if (equals.length === 1) {
              build.predicate = equals[0];
            } else {
              build.predicate = new ComplexPredicate('or', equals);
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
      if (leafletObject.options.continueLoading) {
        let [build, store, modelName] = this._getBuildStoreModelProjectionGeom();
        if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
          let equals = Ember.A();
          featureIds.forEach((id) => {
            let pkField = this.get('odataPkField');
            equals.pushObject(new SimplePredicate(pkField, '==', id));
          });

          if (equals.length === 1) {
            build.predicate = equals[0];
          } else {
            build.predicate = new ComplexPredicate('or', equals);
          }

          let objs = store.query(modelName, build);

          objs.then(res => {
            let models = res.toArray();
            let result = [];
            models.forEach(model => {
              result.push(this.addLayerObject(leafletObject, model, false));
            });
            resolve(result);
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
          let visibility = this.get('layerModel.visibility');
          let hideObjects = Ember.isNone(leafletObject.hideAllLayerObjects) || !leafletObject.hideAllLayerObjects;
          if (leafletObject.options.continueLoading && visibility && checkMapZoom(leafletObject) && hideObjects) {
            let bounds = leafletMap.getBounds();
            let [build, store, modelName, , geometryField] = this._getBuildStoreModelProjectionGeom();
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
              });
              return;
            } else if (loadedBounds.contains(bounds)) {
              if (leafletObject.statusLoadLayer) {
                leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
              }

              return;
            }

            let loadedPart = new NotPredicate(this._getGeomPredicateFromBounds(geometryField, crs, loadedBounds));

            loadedBounds.extend(bounds);
            let newPart = this._getGeomPredicateFromBounds(geometryField, crs, loadedBounds);

            build.predicate = new ComplexPredicate('and', loadedPart, newPart);

            let objs = store.query(modelName, build);

            objs.then(res => {
              let models = res.toArray();
              models.forEach(model => {
                this.addLayerObject(leafletObject, model);
              });
            });

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
