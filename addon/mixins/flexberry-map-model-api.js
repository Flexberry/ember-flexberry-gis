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
    this.deleteLayerObjects(layerId, [objectId]);
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {String} id layer.
    @param {Array} array of id shapes.
  */
  deleteLayerObjects(layerId, objectIds) {
    const layers = this.get('mapLayer');
    var layer = layers.findBy('id', layerId);

    let layerShapes = layer._leafletObject._layers;
    let ids = [];

    for (let key in layerShapes) {
      let shape = layerShapes[key];
      let id = shape.feature !== undefined ? shape.feature.id : undefined;
      if (id === undefined) {
        if (window.mapApi !== undefined && window.mapApi.getLayerObjectId !== undefined) {

          // Need to implement id definition function
          id = window.mapApi.getLayerObjectId(shape);
        } else {
          throw 'Function not defined.';
        }
      }

      if (id !== undefined && objectIds.indexOf(id) !== -1) {
        ids.push(id);
        layer._leafletObject.removeLayer(shape);
      }
    }

    let saveSuccess = (data) => {
      ids.forEach((id) => {
        window.mapApi.deleteLayerById(id);
      });
    };

    layer._leafletObject.once('save:success', saveSuccess);
    layer._leafletObject.save();
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
