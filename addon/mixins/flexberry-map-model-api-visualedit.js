import Ember from 'ember';

export default Ember.Mixin.create({
  changeLayerObjectProperties(layerId, featureId, properties) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId, featureId);
    Object.assign(featureLayer.feature.properties, properties);
    leafletObject.editLayer(featureLayer);
  },

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
  },

  /**
   * Start visual creating of feature
   *
   * @param {String} layerId Id of layer in that should started editing
   * @param {Object} properties New layer properties
   * @returns noting
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
    Return leaflet layer thats corresponds to passed layerId
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
  }
});
