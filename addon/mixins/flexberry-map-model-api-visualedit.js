import Ember from 'ember';
import turfCombine from 'npm:@turf/combine';

export default Ember.Mixin.create({

  /**
    Change layer object properties.

    @method changeLayerObjectProperties
    @param {string} layerId Layer id.
    @param {string} featureId Object id.
    @param {Object} properties Object properties.
    @return {Object} featureLayer.
  */
  changeLayerObjectProperties(layerId, featureId, properties) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId, featureId);
    Object.assign(featureLayer.feature.properties, properties);
    leafletObject.editLayer(featureLayer);
    return featureLayer;
  },

  /**
    Start change layer object.

    @method startChangeLayerObject
    @param {string} layerId Layer id.
    @param {string} featureId Object id.
    @return {Object} Feature layer.
  */
  startChangeLayerObject(layerId, featureId) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId, featureId);
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fitBounds(featureLayer.getBounds());
    this._getEditTools();
    featureLayer.enableEdit(leafletMap);
    leafletMap.on('editable:editing', (e) => {
      if (Ember.isEqual(Ember.guidFor(e.layer), Ember.guidFor(featureLayer))) {
        leafletObject.editLayer(e.layer);
      }
    });

    return featureLayer;
  },

  /**
    Start visual creating of feature

    @param {String} layerId Id of layer in that should started editing
    @param {Object} properties New layer properties
    @returns noting
  */
  startNewObject(layerId, properties) {
    let [layerModel, leafletObject] = this._getModelLayerFeature(layerId);
    let editTools = this._getEditTools();

    let finishDraw = () => {
      editTools.off('editable:drawing:end', finishDraw, this);
      editTools.stopDrawing();
    };

    editTools.on('editable:drawing:end', finishDraw, this);

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fire('flexberry-map:switchToDefaultMapTool');
    if (editTools.drawing()) {
      editTools.stopDrawing();
    }

    let newLayer;
    switch (layerModel.get('settingsAsObject.typeGeometry')) {
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

    let defaultProperties = layerModel.get('settingsAsObject.defaultProperties') || {};
    newLayer.feature = { properties: Ember.merge(defaultProperties, properties) };
    leafletObject.addLayer(newLayer);
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

    @method _getLeafletLayer
    @param {String} layerId
    @returns {Object}
    @private
  */
  _getLayerModel(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    if (Ember.isNone(layer)) {
      throw 'No layer with such id';
    }

    return layer;
  },

  /**

    @method _getModelLayerFeature
    @param {String} layerId Layer id.
    @param {String} featureId Object id.
    @returns {Object[]} [layerModel, leafletObject, featureLayer]
    @private
  */
  _getModelLayerFeature(layerId, featureId) {
    let layerModel = this._getLayerModel(layerId);
    let leafletObject = layerModel.get('_leafletObject');
    let layers = leafletObject._layers;
    let featureLayer;
    if (featureId !== undefined) {
      featureLayer = Object.values(layers).find(feature => {
        const layerFeatureId = this._getLayerFeatureId(layerModel, feature);
        return layerFeatureId === featureId;
      });
    }

    return [layerModel, leafletObject, featureLayer];
  },

  /**
    Start creating multy objects.

    @method startChangeMultyLayerObject
    @param {string} layerId Layer id.
    @param {Object} featureLayer Feature layer.
  */
  startChangeMultyLayerObject(layerId, featureLayer) {
    const layerModel = this._getLayerModel(layerId);
    let leafletObject = layerModel.get('_leafletObject');

    let editTools = this._getEditTools();

    const _disableDraw = () => {
      editTools.off('editable:drawing:end', _disableDraw, this);
      editTools.stopDrawing();

      let leafletMap = this.get('mapApi').getFromApi('leafletMap');

      var featureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      // Define editable objects.
      leafletMap.eachLayer(function (layer) {
        const enabled = Ember.get(layer, 'editor._enabled');
        if (enabled === true) {
          const layerGeoJson = layer.toGeoJSON();
          featureCollection.features.push(layerGeoJson);
        }
      }.bind(this));

      // Coordinate union.
      let fcCombined = turfCombine.default(featureCollection);
      const featureCombined = fcCombined.features.pop();

      Ember.set(featureLayer, 'feature.geometry', featureCombined.geometry);

      // We note that the shape was edited.
      leafletObject.editLayer(featureLayer);
    };

    editTools.on('editable:drawing:end', _disableDraw, this);

    const type = Ember.get(featureLayer, 'feature.geometry.type');
    switch (type) {
      case 'Polygon':
        editTools.startPolygon();
        Ember.set(featureLayer, 'feature.geometry.type', 'MultiPolygon');
        break;
      case 'MultiPolygon':
        editTools.startPolygon();
        break;
      case 'LineString':
        editTools.startPolyline();
        Ember.set(featureLayer, 'feature.geometry.type', 'MultiLineString');
        break;
      case 'MultiLineString':
        editTools.startPolyline();
        break;
    }
  }

});
