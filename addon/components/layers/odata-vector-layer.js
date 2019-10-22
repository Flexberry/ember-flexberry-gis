/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from 'ember-flexberry-gis/components/base-vector-layer';
import { Query } from 'ember-flexberry-data';
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

  // save button at attr panel
  save() {
    /*const layers = Object.values(this.getLayers());
    layers.forEach(layer => {
      let transformToCoords = function(latLngs, options) {
        if (Array.isArray(latLngs[0])) {
          let coords = [];
          for (let i = 0; i < latLngs.length; i++) {
            coords.push(transformToCoords(latLngs[i], options));
          }

          return coords;
        }

        return options.latLngToCoords(latLngs);
      };

      const newCoords = transformToCoords(Ember.get(layer, 'feature.properties.geometry.coordinates'), this.options);
      Ember.set(layer, 'model.geometry.coordinates', newCoords);
      if (Ember.get(layer, 'model.hasDirtyAttributes')) {
        layer.model.save().then((res) => {
          console.log('success');
          Ember.set(res, 'hasChanged', false);
          this.fire('save:success');
        }).catch( function(r) {
          this.fire('save:failed', r);
        });
      }
    }, this);*/
    return this;
  },

  // edit button at panel pressed
  editLayer(layer) {
    //layer.hasChanged = true;

    return this;
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

      let objs = store.query(modelName, builder.build());
      objs.then(res => {
        const options = this.get('options');
        let models = res.toArray();
        let layer = L.featureGroup();

        let crs = this.get('crs');
        layer.options.crs = crs;
        L.setOptions(layer, options);

        layer.save = this.get('save');
        layer.editLayer = this.get('editLayer');
        layer.modelName = modelName;
        layer.projectionName = projectionName;
        layer.editformname = this.get('modelName') + this.get('postfixForEditForm');
        models.forEach(model => {
          let geometry = model.get(geometryField);
          if (!geometry) {
            console.log('No geometry specified for layer');
            return;
          }

          let geometryCoordinates = this.transformLatLng(geometry.coordinates);

          let innerLayer = null;
          if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            innerLayer = L.polygon(geometryCoordinates[0]);
          }
          else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
            innerLayer = L.polyline(geometryCoordinates);
          } else if (geometry.type === 'Point') {
            innerLayer = L.marker(geometryCoordinates);
          }

          let modelProj = model.constructor.projections.get(projectionName);
          innerLayer.model = model;
          innerLayer.modelProj = modelProj;
          innerLayer.feature = {
            type: 'Feature',
            properties: this.createPropsFromModel(model)
          };
          layer.addLayer(innerLayer);
        });
        resolve(layer);
      }).catch((e) => {
        reject(e);
      });
    });
  },

  transformLatLng(coordinates) {
    if (Array.isArray(coordinates[0])) {
      let latLngs = [];
      for (let i = 0; i < coordinates.length; i++) {
        latLngs.push(this.transformLatLng(coordinates[i]));
      }

      return latLngs;
    }

    const coordsToLatLng = this.get('coordsToLatLng');

    return Ember.isNone(coordsToLatLng) ? L.latLng([coordinates[1], coordinates[0]]) : new Function('coords', coordsToLatLng)(coordinates);
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
