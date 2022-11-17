import Ember from 'ember';
import turfCombine from 'npm:@turf/combine';
import SnapDraw from './snap-draw';
import { zoomToBounds } from '../utils/zoom-to-bounds';

export default Ember.Mixin.create(SnapDraw, {

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
    @param {Boolean} snap Snap or not
    @param {Array} snapLayers Layers for snap
    @param {Integer} snapDistance in pixels
    @param {Boolean} snapOnlyVertex or segments too
    @return {Promise} Feature layer.
  */
  startChangeLayerObject(layerId, featureId, snap, snapLayers, snapDistance, snapOnlyVertex) {
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

        let minZoom = Ember.get(leafletObject, 'minZoom');
        let maxZoom = Ember.get(leafletObject, 'maxZoom');
        zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
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

          if (!featureLayerLoad) {
            reject(`Object '${featureId}' not found`);
          }

          let editTools = this._getEditTools();

          this.disableLayerEditing(leafletMap);

          featureLayerLoad.enableEdit(leafletMap);
          featureLayerLoad.layerId = layerId;

          this._checkAndEnableSnap(snap, snapLayers, snapDistance, snapOnlyVertex, true);
          editTools.on('editable:editing', (e) => {
            if (Ember.isEqual(Ember.guidFor(e.layer), Ember.guidFor(featureLayerLoad))) {
              leafletObject.editLayer(e.layer);
            }
          });

          editTools.once('editable:disable', this._stopSnap, this);

          resolve(featureLayerLoad);
        });
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Cancel edit for layer objects.

    @method cancelLayerEdit
    @param {[String]} layerIds array id of layer object.
    @return {Ember.RSVP.Promise} Returns promise.
  */
  cancelLayerEdit(layerIds) {
    let e = {
      layerIds: layerIds,
      results: Ember.A()
    };
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let editTools = this._getEditTools();
    editTools.off('editable:drawing:end');
    editTools.off('editable:editing');
    editTools.stopDrawing();
    leafletMap.fire('flexberry-map:cancelEdit', e);
    return Ember.RSVP.all(e.results);
  },

  /**
    Cancel edit for layer object.

    @method cancelEdit
    @param {Object} layer layer object.
    @return nothing
  */
  cancelEdit(layer) {
    let editTools = this._getEditTools();
    editTools.off('editable:drawing:end');
    editTools.off('editable:editing');
    editTools.stopDrawing();
    this._stopSnap();

    if (!Ember.isNone(layer) && !Ember.isNone(layer.layerId)) {
      let [, leafletObject] = this._getModelLeafletObject(layer.layerId);
      let id = leafletObject.getLayerId(layer);
      let e = {
        layerIds: [layer.layerId],
        ids: [id],
        results: Ember.A()
      };
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');
      leafletMap.fire('flexberry-map:cancelEdit', e);
      layer.layerId = null;
    }
  },

  /**
    Start visual creating of feature

    @method startNewObject
    @param {String} layerId Id of layer in that should started editing
    @param {Object} properties New layer properties
    @param {Boolean} snap Snap or not
    @param {Array} snapLayers Layers for snap
    @param {Integer} snapDistance in pixels
    @param {Boolean} snapOnlyVertex or segments too
    @returns {Object} Layer object
  */
  startNewObject(layerId, properties, snap, snapLayers, snapDistance, snapOnlyVertex) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      try {
        let [layerModel, leafletObject] = this._getModelLeafletObject(layerId);
        let editTools = this._getEditTools();
        let newLayer;

        let finishDraw = () => {
          editTools.off('editable:drawing:end', finishDraw, this);
          editTools.stopDrawing();
          let defaultProperties = layerModel.get('settingsAsObject.defaultProperties') || {};
          newLayer.feature = { type: 'Feature', properties: Ember.merge(defaultProperties, properties) };
          newLayer.remove();

          let e = { layers: [newLayer], results: Ember.A() };
          leafletObject.fire('load', e);

          Ember.RSVP.allSettled(e.results).then(() => {
            this._stopSnap();

            this._checkAndEnableSnap(snap, snapLayers, snapDistance, snapOnlyVertex, true);
            editTools.once('editable:disable', this._stopSnap, this);
            resolve(newLayer);
          });
        };

        editTools.on('editable:drawing:end', finishDraw, this);

        let leafletMap = this.get('mapApi').getFromApi('leafletMap');
        leafletMap.fire('flexberry-map:switchToDefaultMapTool');
        if (editTools.drawing()) {
          editTools.stopDrawing();
        }

        this.disableLayerEditing(leafletMap);

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
        this._checkAndEnableSnap(snap, snapLayers, snapDistance, snapOnlyVertex, false);
        newLayer.layerId = layerId;
      } catch (error) {
        reject(error);
      }
    });
  },

  _checkAndEnableSnap(snap, snapLayers, snapDistance, snapOnlyVertex, edit) {
    this._stopSnap();

    if (snap) {
      let layers = snapLayers.map((id) => {
        let [, leafletObject] = this._getModelLeafletObject(id);
        return leafletObject;
      }).filter(l => !!l);
      layers.forEach((l, i) => {
        l.on('load', this._setSnappingFeatures, this);
      });
      this.set('_snapLayersGroups', layers);
      this._setSnappingFeatures();

      if (snapDistance) {
        this.set('_snapDistance', snapDistance);
      }

      if (!Ember.isNone(snapOnlyVertex)) {
        this.set('_snapOnlyVertex', snapOnlyVertex);
      }

      this._startSnap(edit);
    }
  },

  _stopSnap() {
    let editTools = this._getEditTools();
    editTools.off('editable:drawing:move', this._handleSnapping, this);
    editTools.off('editable:drawing:click', this._drawClick, this);

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.off('editable:vertex:drag', this._handleSnapping, this);

    let layers = this.get('_snapLayersGroups');
    if (layers) {
      layers.forEach((l, i) => {
        if (l) {
          l.off('load', this._setSnappingFeatures, this);
        }
      });
    }

    this._cleanupSnapping();
  },

  _startSnap(edit) {
    let editTools = this._getEditTools();
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');

    if (edit) {
      leafletMap.on('editable:vertex:drag', this._handleSnapping, this);
    } else {
      // маркер, который будет показывать возможную точку прилипания
      this.set('_snapMarker', L.marker(leafletMap.getCenter(), {
        icon: editTools.createVertexIcon({ className: 'leaflet-div-icon leaflet-drawing-icon' }),
        opacity: 1,
        zIndexOffset: 1000
      }));

      editTools.on('editable:drawing:move', this._handleSnapping, this);
      editTools.on('editable:drawing:click', this._drawClick, this);
    }
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
    @param {Boolean} loadNew flag which indicate load new feature or not
    @returns {[layerModel, leafletObject, featureLayer]} Get [layerModel, leafletObject, featureLayer] or [layerModel, leafletObject, undefined].
    @private
  */
  _getModelLayerFeature(layerId, featureIds, load = false, loadNew = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');

      let e = {
        featureIds: featureIds,
        layer: layerId,
        load: load,
        loadNew: loadNew,
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
            if (!Ember.isNone(featureIds) && featureIds.length > 0) {
              featureLayer = Object.values(layers).filter(feature => {
                const layerFeatureId = this._getLayerFeatureId(e.results[0].layerModel, feature);
                return featureIds.some((f) => { return layerFeatureId === f; });
              });
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
    @param {Boolean} snap Snap or not
    @param {Array} snapLayers Layers for snap
    @param {Integer} snapDistance in pixels
    @param {Boolean} snapOnlyVertex or segments too
    @return nothing
  */
  startChangeMultyLayerObject(layerId, featureLayer, snap, snapLayers, snapDistance, snapOnlyVertex) {
    let [layerModel, leafletObject] = this._getModelLeafletObject(layerId);

    let editTools = this._getEditTools();
    let newLayer;
    featureLayer.layerId = layerId;

    const disableDraw = () => {
      editTools.off('editable:drawing:end', disableDraw, this);
      editTools.stopDrawing();

      this._stopSnap();
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

      newLayer.remove();

      // We note that the shape was edited.
      leafletObject.editLayer(featureLayer);

      this._checkAndEnableSnap(snap, snapLayers, snapDistance, snapOnlyVertex, true);
      editTools.once('editable:disable', this._stopSnap, this);
    };

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    this.disableLayerEditing(leafletMap);

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

    this._checkAndEnableSnap(snap, snapLayers, snapDistance, snapOnlyVertex, false);
  }
});
