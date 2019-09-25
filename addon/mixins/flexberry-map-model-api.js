import Ember from 'ember';

export default Ember.Mixin.create({
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
    Remove shape from layer.

    @method deleteLayerObject.
    @param {String} id layer.
    @param {String} id shape.
  */
  deleteLayerObject(layerId, objectId) {

    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    let layerShapes = layer._leafletObject._layers;
    //let leafletObject = layerShapes[204].feature.id;
  debugger;
    var layerShapekeys = Object.keys(layerShapes);

    // for (shape in layerShapes) {
    for (let i = 0; i < layerShapekeys.length; i++) {
     let shape = layerShapes[layerShapekeys[i]];
      let id = shape.feature !== undefined ? shape.feature.id : undefined;
      if (id === undefined) {
        if (window.mapApi !== undefined && window.mapApi.getLayerObjectId !== undefined) {

          // Need to implement id definition function
          id = window.mapApi.getLayerObjectId(shape);
        } else {//todo:возможно удалить
            throw 'Function not defined.';
        }
      }
      if (id !== undefined && id === objectId) {
        layer._leafletObject.removeLayer(shape);
        //layer._leafletObject._map.invalidateSize();
        // delete layerShapes[layerShapekeys[i]];
        break;
      }

    }

    layer._leafletObject.save();
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {String} id layer.
    @param {Array} array of id shapes.
  */
  deleteLayerObjects(layerId, objectIds) {
    objectIds.forEach(id => {
      this.deleteLayerObject(layerId, id)
    });
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
});
