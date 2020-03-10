/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import { Query } from 'ember-flexberry-data';
import { GeometryPredicate } from 'ember-flexberry-data/query/predicate';
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

  addLayerObject(layer, model) {
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
      innerLayer.model = model;
      innerLayer.modelProj = modelProj;
      innerLayer.feature = {
        type: 'Feature',
        properties: this.createPropsFromModel(model),
        leafletLayer: innerLayer
      };
      if (typeof (innerLayer.setStyle) === 'function') {
        innerLayer.setStyle(Ember.get(layer, 'leafletObject.options.style'));
      }

      layer.addLayer(innerLayer);
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
      const modelName = this.get('modelName');
      const projectionName = this.get('projectionName');
      const geometryField = this.get('geometryField') || 'geometry';
      const store = this.get('store');

      if (!modelName) {
        reject('No model found for this layer');
      }

      let builder = new Builder(store)
        .from(modelName)
        .selectByProjection(projectionName);

      let leafletMap = this.get('leafletMap');
      let bounds = leafletMap.getBounds();
      let query = new GeometryPredicate(geometryField);
      let build = builder.build();
      build.predicate = query.intersects(`SRID=4326;POLYGON(${bounds.getNorthWest().lng} ${bounds.getNorthWest().lat}, ${bounds.getNorthEast().lng} ${bounds.getNorthEast().lat}, 
        ${bounds.getSouthEast().lng} ${bounds.getSouthEast().lat}, ${bounds.getSouthWest().lng} ${bounds.getSouthWest().lat}`);

      let objs = store.query(modelName, build);
      //let objs = store.query(modelName, query.intersects(bounds));
      objs.then(res => {
        const options = this.get('options');
        let models = res.toArray();
        let layer = L.featureGroup();

        let crs = this.get('crs');
        layer.options.crs = crs;

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
  }
});
