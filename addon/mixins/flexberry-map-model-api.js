import Ember from 'ember';
import lineIntersect from 'npm:@turf/line-intersect';

export default Ember.Mixin.create({
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

  /**
    Shows specified by id layers.

    @method showLayers.
  */
  showLayers(layerIds) {
    this._setVisibility(layerIds, true);
  },

  /**
    Hides specified by id layers.

    @method showLayers.
  */
  hideLayers(layerIds) {
    this._setVisibility(layerIds);
  },

  /**
    Creates new layer with specified options.
    @method createNewLayer.
  */
  createNewLayer(options) {
    options = options || {};
    const store = this.get('store');
    let layer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', options);
    layer.set('map', this);
    return layer.save().then(()=> {
      const layers = this.get('hierarchy');
      layers.addObject(layer);
      return layer.get('id');
    });
  },

  /**
    Remove shape from layer.

    @method deleteLayerObject.
    @param {String} layerId Id layer.
    @param {String} featureId Id shape.
    @return {Promise} Return target feature.
  */
  deleteLayerObject(layerId, featureId) {
    return this.deleteLayerObjects(layerId, [featureId]);
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {String} layerId Id layer.
    @param {OBject[]} featureIds Array of id shapes.
  */
  deleteLayerObjects(layerId, featureIds) {
    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    let ids = [];
    layer._leafletObject.eachLayer(function (shape) {
      const id = this._getLayerFeatureId(layer, shape);

      if (!Ember.isNone(id) && featureIds.indexOf(id) !== -1) {
        ids.push(id);
        layer._leafletObject.removeLayer(shape);
      }
    }.bind(this));

    const deleteLayerFromAttrPanelFunc = this.get('mapApi').getFromApi('_deleteLayerFromAttrPanel');
    ids.forEach((id) => {
      if (typeof deleteLayerFromAttrPanelFunc === 'function') {
        deleteLayerFromAttrPanelFunc(id, layer);
      }
    });

    return new Ember.RSVP.Promise((resolve, reject) => {
      const saveSuccess = (data) => {
        layer._leafletObject.off('save:failed', saveSuccess);
        resolve(data);
      };

      const saveFailed = (data) => {
        layer._leafletObject.off('save:success', saveSuccess);
        reject(data);
      };

      layer._leafletObject.once('save:success', saveSuccess);
      layer._leafletObject.once('save:failed', saveFailed);
      layer._leafletObject.save();
    });
  },

  /**
    Gets intersected features.
    @method getIntersectionObjects
    @param {String} featureId feature id with which we are looking for intersections
    @param {Array} layerIds array of layers ids
  */
  getIntersectionObjects(featureId, layerIds) {
    let result = [];
    let featureToSearch;
    if (Ember.isArray(layerIds)) {
      const allLayers = this.get('mapLayer');
      let layers = Ember.A(allLayers);
      layers.find(layer => {
        let features = Ember.get(layer, '_leafletObject._layers');
        if (!Ember.isNone(features)) {
          featureToSearch = Object.values(features).find(feature => {
            if (this._getLayerFeatureId(layer, feature) === featureId) {
              return true;
            }
          });

          if (featureToSearch) {
            return true;
          }
        }
      });
      if (!Ember.isNone(featureToSearch)) {
        layerIds.forEach(id => {
          let intersectedFeaturesCollection = [];
          const layer = layers.findBy('id', id);
          let features = Ember.get(layer, '_leafletObject._layers');
          if (features) {
            Object.values(features).forEach(feature => {
              let intersectionResult;
              const layerFeatureId = this._getLayerFeatureId(layer, feature);
              if (layerFeatureId !== featureId) {
                intersectionResult = lineIntersect(featureToSearch.feature, Ember.get(feature, 'feature'));
              }

              if (intersectionResult && intersectionResult.features.length > 0) {
                intersectedFeaturesCollection.push(layerFeatureId);
              }
            });
          }

          if (intersectedFeaturesCollection.length > 0) {
            result.push({ id: id, intersected_features: intersectedFeaturesCollection });
          }
        });
      }
    }

    return result;
  },

  _setVisibility(layerIds, visibility = false) {
    if (Ember.isArray(layerIds)) {
      const layers = this.get('mapLayer');
      layerIds.forEach(id => {
        const layer = layers.findBy('id', id);
        if (layer) {
          layer.set('visibility', visibility);
        }
      });
    }
  },

  _getLayerFeatureId(layer, layerObject) {
    const getLayerFeatureId = this.get('mapApi').getFromApi('getLayerFeatureId');
    if (typeof getLayerFeatureId === 'function') {
      return getLayerFeatureId(layer, layerObject);
    }

    return Ember.get(layerObject, 'feature.id');
  },

  /**
    Move Object From one  layer to another.
    @method moveObjectToLayer
    @param {String} objectId GeoJSON object id
    @param {String} fromLayerId id of layer to remove object
    @param {String} tolayerId  id of layer to add object
  */
  moveObjectToLayer(objectId, fromLayerId, toLayerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let objectToSearch;
      let store = this.get('store');
      let layerFrom = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', fromLayerId);
      let layerTo = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', toLayerId);
      if (layerFrom && layerTo) {
        let features = Ember.get(layerFrom, '_leafletObject._layers');
        if (features) {
          objectToSearch = Object.values(features).find(feature=> {
            const layerFeatureId = this._getLayerFeatureId(layerFrom, feature);
            return layerFeatureId === objectId;
          });
        }

        if (objectToSearch) {
          layerFrom._leafletObject.removeLayer(objectToSearch);
          objectToSearch._leaflet_id = null;
          var newObj = this.createGeometryType(objectToSearch, reject);
          if (Ember.isNone(newObj)) {
            reject('unknown geomerty type');
          }

          newObj.options = objectToSearch.options;
          Ember.get(layerTo, '_leafletObject').addLayer(newObj);
          let promiseSaveLayerTo = new Ember.RSVP.Promise((resolve, reject)=> {
            const saveSuccess = (data) => {
              layerTo._leafletObject.off('save:failed', saveSuccess);
              resolve(data);
            };

            const saveFailed = (data) => {
              layerTo._leafletObject.off('save:success', saveSuccess);
              reject(data);
            };

            layerTo._leafletObject.once('save:success', saveSuccess);
            layerTo._leafletObject.once('save:failed', saveFailed);
            layerTo._leafletObject.save();
          });
          let promiseSaveLayerFrom = new Ember.RSVP.Promise((resolve, reject)=> {
            const saveSuccess2 = (data) => {
              layerFrom._leafletObject.off('save:failed', saveSuccess2);
              resolve(data);
            };

            const saveFailed2 = (data) => {
              layerFrom._leafletObject.off('save:success', saveSuccess2);
              reject(data);
            };

            layerFrom._leafletObject.once('save:success', saveSuccess2);
            layerFrom._leafletObject.once('save:failed', saveFailed2);
            layerFrom._leafletObject.save();
          });
          Ember.RSVP.all([promiseSaveLayerTo, promiseSaveLayerFrom])
            .then(()=> {
              resolve('object moved successfully');
            }, ()=> {
              reject('error while saving layers');
            });
        } else {
          reject('no object with such id');
        }
      } else {
        reject('no layer with such id');
      }
    });
  },

  /**
    Create new Lealfet object according to objectToDefine geometry type.
    @method  createGeometryType
    @param {String} objectToDefine GeoJSON object.
  */
  createGeometryType(objectToDefine) {
    switch (Ember.get(objectToDefine, 'feature.geometry.type')) {
      case 'Marker' :
        return L.marker(objectToDefine.getLatLng());
      case 'Circle' :
        return L.circle(objectToDefine.getLatLng(), objectToDefine.getRadius());
      case 'LineString' :
        return L.polyline(objectToDefine.getLatLngs());
      case 'MultiLineString' :
        return L.polyline(objectToDefine.getLatLngs());
      case 'Polygon' :
        return L.polygon(objectToDefine.getLatLngs());
      case 'MultiPolygon' :
        return L.polygon(objectToDefine.getLatLngs());
      default: return undefined;
    }
  }
});
