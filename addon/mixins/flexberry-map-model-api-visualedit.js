import Ember from 'ember';
import turfCombine from 'npm:@turf/combine';
import WfsLayer from '../layers/wfs';
import OdataLayer from '../layers/odata-vector';
import state from '../utils/state';

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
      this._getModelLayerFeature(layerId, [featureId], true).then(([, leafletObject, featureLayer]) => {
        Object.assign(featureLayer[0].feature.properties, properties);
        leafletObject.editLayer(featureLayer[0]);
        resolve(featureLayer[0]);
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
      this._getModelLayerFeature(layerId, [featureId]).then(([layerModel, leafletObject, featureLayer]) => {
        let leafletMap = this.get('mapApi').getFromApi('leafletMap');
        leafletObject.statusLoadLayer = true;
        let bounds;
        if (featureLayer[0] instanceof L.Marker) {
          let featureGroup = L.featureGroup().addLayer(featureLayer[0]);
          bounds = featureGroup.getBounds();
        } else {
          bounds = featureLayer[0].getBounds();
        }

        leafletMap.fitBounds(bounds);
        if (Ember.isNone(leafletObject.promiseLoadLayer) || !(leafletObject.promiseLoadLayer instanceof Ember.RSVP.Promise)) {
          leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
        }

        leafletObject.promiseLoadLayer.then(() => {
          leafletObject.statusLoadLayer = false;
          leafletObject.promiseLoadLayer = null;
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
        });
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
    editTools.off('editable:drawing:end');
    editTools.off('editable:editing');
    editTools.stopDrawing();

    if (!Ember.isNone(layer.layerId)) {
      let [layerModel, leafletObject] = this._getModelLeafletObject(layer.layerId);
      if (!Ember.isNone(leafletObject)) {
        let className = Ember.get(layerModel, 'type');
        let layerType = Ember.getOwner(this).knownForType('layer', className);
        if (layerType instanceof OdataLayer) {
          let model = Ember.get(layer, 'model');
          model.rollbackAttributes();
        }

        if (layer.state === state.insert) {
          leafletObject.removeLayer(layer);
          let id = editTools.featuresLayer.getLayerId(layer);
          let editLayer = editTools.featuresLayer.getLayer(id).editor.editLayer;
          editTools.editLayer.removeLayer(editLayer);
          editTools.featuresLayer.removeLayer(layer);
        } else if (layer.state === state.update) {
          let editLayer = layer.editor.editLayer;
          editTools.editLayer.removeLayer(editLayer);
          let map = Ember.get(leafletObject, '_map');
          map.removeLayer(layer);
          let id = leafletObject.getLayerId(layer);
          delete leafletObject._layers[id];
          if (layerType instanceof WfsLayer) {
            let filter = new L.Filter.EQ('primarykey', Ember.get(layer, 'feature.properties.primarykey'));
            leafletObject.loadFeatures(filter);
            delete leafletObject.changes[id];
          } else if (layerType instanceof OdataLayer) {
            let e = {
              featureIds: [Ember.get(layer, 'feature.properties.primarykey')]
            };
            leafletObject.loadLayerFeatures(e);
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
      newLayer.remove();
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
    @param {Object[]} featureIds Array object id.
    @param {Boolean} load flag which indicate load or get feature
    @returns {[layerModel, leafletObject, featureLayer]} Get [layerModel, leafletObject, featureLayer] or [layerModel, leafletObject, undefined].
    @private
  */
  _getModelLayerFeature(layerId, featureIds, load = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');
      let e = {
        featureIds: featureIds,
        layer: layerId,
        load: load,
        results: Ember.A()
      };

      leafletMap.fire('flexberry-map:getOrLoadLayerFeatures', e);
      if (Ember.isEmpty(e.results)) {
        reject(`Layer '${layerId}' not found`);
        return;
      }

      let features = Ember.get(e.results[0], 'features');
      if (features instanceof Ember.RSVP.Promise) {
        features.then((layerObject) => {
          if (Ember.isEmpty(layerObject) || Ember.isNone(layerObject)) {
            reject(`Object '${featureIds}' not found`);
            return;
          }

          let featureLayer = [];
          if (load) {
            let layers = layerObject._layers;
            if (!Ember.isNone(featureIds) && featureIds.length === 1) {
              let obj = Object.values(layers).find(feature => {
                const layerFeatureId = this._getLayerFeatureId(e.results[0].layerModel, feature);
                return layerFeatureId === featureIds[0];
              });

              featureLayer.push(obj);
            }
          } else {
            featureLayer = layerObject;
          }

          resolve([e.results[0].layerModel, e.results[0].leafletObject, featureLayer]);
        }).catch(() => {
          reject(`Object '${featureIds}' not found`);
        });
      } else {
        reject('Result is not promise');
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
