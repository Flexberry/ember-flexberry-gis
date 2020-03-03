import Ember from 'ember';
import turfCombine from 'npm:@turf/combine';

export default Ember.Mixin.create({

  /**
    Change layer object properties.

    @method changeLayerObjectProperties
    @param {string} layerId Layer ID.
    @param {string} featureId Object ID.
    @param {Object} properties Object properties.
    @return {Promise} Layer object.
  */
  changeLayerObjectProperties(layerId, featureId, properties) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getModelLayerFeature(layerId, featureId, true).then(([, leafletObject, featureLayer]) => {
        Object.assign(featureLayer.feature.properties, properties);
        leafletObject.editLayer(featureLayer);
        resolve(featureLayer);
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Start change layer object.

    @method startChangeLayerObject
    @param {string} layerId Layer ID.
    @param {string} featureId Object ID.
    @return {Promise} Feature layer.
  */
  startChangeLayerObject(layerId, featureId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getModelLayerFeature(layerId, featureId).then(([layerModel, leafletObject, featureLayer]) => {
        let leafletMap = this.get('mapApi').getFromApi('leafletMap');
        leafletMap.fitBounds(featureLayer.getBounds());
        let layers = leafletObject._layers;
        let featureLayerLoad = Object.values(layers).find(feature => {
          const layerFeatureId = this._getLayerFeatureId(layerModel, feature);
          return layerFeatureId === featureId;
        });

        let editTools = this._getEditTools();

        featureLayerLoad.enableEdit(leafletMap);
        featureLayerLoad.layerId = layerId;

        editTools.on('editable:editing', (e) => {
          if (Ember.isEqual(Ember.guidFor(e.layer), Ember.guidFor(featureLayerLoad))) {
            leafletObject.editLayer(e.layer);
          }
        });

        resolve(featureLayerLoad);
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Cancel edit for layer object.

    @method cancelEdit
    @param {Object} layer layer object.
    @return nothing
  */
  cancelEdit(layer) {
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let editTools = this._getEditTools();
    this.disableLayerEditing(leafletMap);
    editTools.off('editable:drawing:end');
    editTools.off('editable:editing');
    editTools.stopDrawing();
    editTools.featuresLayer.clearLayers();
    editTools.editLayer.clearLayers();

    if (!Ember.isNone(layer.layerId)) {
      let [, leafletObject] = this._getModelLeafletObject(layer.layerId);
      if (!Ember.isNone(leafletObject)) {
        if (layer.state === leafletObject.state.insert) {
          leafletObject.removeLayer(layer);
        } else if (layer.state === leafletObject.state.update) {
          let map = Ember.get(leafletObject, '_map');
          map.removeLayer(layer);
          let filter = new L.Filter.EQ('primarykey', Ember.get(layer, 'feature.properties.primarykey'));
          let feature = leafletObject.loadFeatures(filter);

          let id = leafletObject.getLayerId(layer);
          if (id in leafletObject.changes) {
            delete leafletObject.changes[id];
            delete leafletObject._layers[id];
          }
        }
      }

      layer.layerId = null;
    }
  },

  /**
    Start visual creating of feature

    @method startNewObject
    @param {String} layerId Id of layer in that should started editing
    @param {Object} properties New layer properties
    @returns {Object} Layer object
  */
  startNewObject(layerId, properties) {
    let [layerModel, leafletObject] = this._getModelLeafletObject(layerId);
    let editTools = this._getEditTools();
    let newLayer;

    let finishDraw = () => {
      editTools.off('editable:drawing:end', finishDraw, this);
      editTools.stopDrawing();
      let defaultProperties = layerModel.get('settingsAsObject.defaultProperties') || {};
      newLayer.feature = { properties: Ember.merge(defaultProperties, properties) };
      leafletObject.addLayer(newLayer);
    };

    editTools.on('editable:drawing:end', finishDraw, this);

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fire('flexberry-map:switchToDefaultMapTool');
    if (editTools.drawing()) {
      editTools.stopDrawing();
    }

    switch (layerModel.get('settingsAsObject.typeGeometry').toLowerCase()) {
      case 'polygon':
        newLayer = editTools.startPolygon();
        break;
      case 'polyline':
        newLayer = editTools.startPolyline();
        break;
      case 'marker':
        newLayer = editTools.startMarker();
        break;
      default:
        throw 'Unknown layer type: ' + layerModel.get('settingsAsObject.typeGeometry');
    }

    newLayer.layerId = layerId;
    return newLayer;
  },

  /**
    Get editTools.

    @method _getEditTools
    @return {Object} EditTools.
    @private
  */
  _getEditTools() {
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let editTools = Ember.get(leafletMap, 'editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      Ember.set(leafletMap, 'editTools', editTools);
    }

    return editTools;
  },

  /**
    Return leaflet layer thats corresponds to passed layerId.

    @method getLayerModel
    @param {String} layerId Layer ID
    @returns {Object} Layer
  */
  getLayerModel(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    if (Ember.isNone(layer)) {
      throw `Layer '${layerId}' not found`;
    }

    return layer;
  },

  /**
    Get [layerModel, leafletObject, featureLayer] by layer id or layer id and object id.

    @param {string} layerId Layer id.
    @param {string} [featureId] Object id.
    @returns {[layerModel, leafletObject, featureLayer]} Get [layerModel, leafletObject, featureLayer] or [layerModel, leafletObject, undefined].
    @private
  */
  _getModelLayerFeature(layerId, featureId, load = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');
      let e = {
        featureIds: [featureId],
        layer: layerId,
        results: Ember.A()
      };

      if (load) {
        leafletMap.fire('flexberry-map:loadLayerFeatures', e);

        if (Ember.isEmpty(e.results)) {
          reject(`Layer '${layerId}' not found`);
        } else {
          let features = Ember.get(e.results[0], 'features');
          if (features instanceof Ember.RSVP.Promise) {
            features.then((layerObject) => {
              let layers = layerObject._layers;
              let featureLayer = Object.values(layers).find(feature => {
                const layerFeatureId = this._getLayerFeatureId(e.results[0].layerModel, feature);
                return layerFeatureId === featureId;
              });
              if (Ember.isNone(featureLayer)) {
                reject(`Object '${featureId}' not found`);
              } else {
                resolve([e.results[0].layerModel, e.results[0].leafletObject, featureLayer]);
              }

              if (Ember.isEmpty(layerObject)) {
                reject(`Object '${featureId}' not found`);
              } else {
                resolve([e.results[0].layerModel, e.results[0].leafletObject, layerObject[0]]);
              }
            });
          }
        }
      } else {
        leafletMap.fire('flexberry-map:getLayerFeatures', e);

        if (Ember.isEmpty(e.results)) {
          reject(`Layer '${layerId}' not found`);
        } else {
          let features = Ember.get(e.results[0], 'features');
          if (features instanceof Ember.RSVP.Promise) {
            features.then((layerObject) => {
              if (Ember.isEmpty(layerObject)) {
                reject(`Object '${featureId}' not found`);
              } else {
                resolve([e.results[0].layerModel, e.results[0].leafletObject, layerObject[0]]);
              }
            });
          }
        }
      }
    });
  },

  /**
    Get all features by layer id.

    @method _getFeaturesOfLayer
    @param {string} layerId Layer id.
    @returns {Ember.RSVP.Promise} layer objects.
    @private
  */
  _getFeaturesOfLayer(layerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let e = {
        featureIds: null,
        layer: layerId,
        results: Ember.A()
      };
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');

      leafletMap.fire('flexberry-map:getLayerFeatures', e);
      if (Ember.isEmpty(e.results)) {
        reject(`Layer '${layerId}' not found`);
      } else {
        let features = Ember.get(e.results[0], 'features');
        if (features instanceof Ember.RSVP.Promise) {
          features.then((layerObject) => {
            if (Ember.isEmpty(layerObject)) {
              reject(`Layer '${layerId}' is empty`);
            } else {
              resolve([e.results[0].layerModel, layerObject]);
            }
          });
        }
      }
    });
  },

  /**
    Load features by layer id.

    @method _loadFeaturesOfLayer
    @param {string} layerId Layer id.
    @param {Object[]} featureIds Array of objects IDs.
    @returns {Ember.RSVP.Promise} layer objects.
    @private
  */
  _loadFeaturesOfLayer(layerId, featureIds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let e = {
        featureIds: featureIds,
        layer: layerId,
        results: Ember.A()
      };
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');

      leafletMap.fire('flexberry-map:loadLayerFeatures', e);
      if (Ember.isEmpty(e.results)) {
        reject(`Layer '${layerId}' not found`);
      } else {
        let features = Ember.get(e.results[0], 'features');
        if (features instanceof Ember.RSVP.Promise) {
          features.then((leafletObject) => {
            if (Ember.isEmpty(leafletObject)) {
              reject(`Layer '${layerId}' is empty`);
            } else {
              resolve([e.results[0].layerModel, leafletObject]);
            }
          });
        }
      }
    });
  },

  /**
    Get [layerModel, leafletObject] by layer id.

    @param {string} layerId Layer id.
    @returns {[layerModel, leafletObject]} Get [layerModel, leafletObject].
    @private
  */
  _getModelLeafletObject(layerId) {
    let layerModel = this.get('mapLayer').findBy('id', layerId);
    if (Ember.isNone(layerModel)) {
      throw `Layer '${layerId}' not found`;
    }

    let leafletObject = layerModel.get('_leafletObject');
    return [layerModel, leafletObject];
  },

  /**
    Start creating multy objects.

    @method startChangeMultyLayerObject
    @param {string} layerId Layer id.
    @param {Object} featureLayer Feature layer.
    @return nothing
  */
  startChangeMultyLayerObject(layerId, featureLayer) {
    let [layerModel, leafletObject] = this._getModelLeafletObject(layerId);

    let editTools = this._getEditTools();
    let newLayer;
    featureLayer.layerId = layerId;

    const disableDraw = () => {
      editTools.off('editable:drawing:end', disableDraw, this);
      editTools.stopDrawing();

      var featureCollection = {
        type: 'FeatureCollection',
        features: [featureLayer.toGeoJSON(), newLayer.toGeoJSON()]
      };

      // Coordinate union.
      let fcCombined = turfCombine.default(featureCollection);
      const featureCombined = L.geoJSON(fcCombined);
      const combinedLeaflet = featureCombined.getLayers()[0];
      featureLayer.setLatLngs(combinedLeaflet.getLatLngs());
      featureLayer.disableEdit();
      featureLayer.enableEdit();
      editTools.featuresLayer.clearLayers();

      // We note that the shape was edited.
      leafletObject.editLayer(featureLayer);
    };

    editTools.on('editable:drawing:end', disableDraw, this);

    switch (layerModel.get('settingsAsObject.typeGeometry').toLowerCase()) {
      case 'polygon':
        newLayer = editTools.startPolygon();
        break;
      case 'polyline':
        newLayer = editTools.startPolyline();
        break;
      case 'marker':
        newLayer = editTools.startMarker();
        break;
      default:
        throw 'Unknown layer type: ' + layerModel.get('settingsAsObject.typeGeometry');
    }
  }
});
