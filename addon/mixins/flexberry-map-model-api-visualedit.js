import Ember from 'ember';

export default Ember.Mixin.create({
  startChangeLayerObject(layerId, featureId) {
    let layerModel = this._getLayerModel(layerId);
    let layers = layerModel.get('_leafletObject._layers');
    let featureLayer = Object.values(layers).find(feature => {
      const layerFeatureId = this._getLayerFeatureId(layerModel, feature);
      return layerFeatureId === featureId;
    });

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fitBounds(featureLayer.getBounds());
    this._getEditTools();
    featureLayer.enableEdit(leafletMap);
  },

  /**
   * Start visual creating of feature
   *
   * @param {String} layerId Id of layer in that should started editing
   * @param {Object} properties New layer properties
   * @returns noting
   */
  startNewObject(layerId, properties) {
    let layerModel = this._getLayerModel(layerId);
    let leafletObject = layerModel.get('_leafletObject');
    let editTools = this._getEditTools();
    editTools.on('editable:drawing:end', this._finishDraw, this);

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fire('flexberry-map:switchToDefaultMapTool');
    if(editTools.drawing()) {
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

  saveLayers(layerIds) {
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

  _finishDraw() {
    let editTools = this._getEditTools();
    editTools.off('editable:drawing:end', this._finishDraw, this);
    editTools.stopDrawing();
  }
});
