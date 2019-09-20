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
  deleteLayerObject(layerId, objectId) {//57cebb75-a9a1-47b0-877a-49fdccb86ad4 ,
    debugger;
    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    // layerIds.forEach(id => {
    //   const layer = layers.findBy('id', id);
    //   if (layer) {
    //     //layer.set('visibility', visibility);
    //   }
    // });
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {String} id layer.
    @param {Array} array of id shapes.
  */
  deleteLayerObjects(layerId, objectIds) {
    objectIds.forEach(id => {
      deleteLayerObject(layerId, id)
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
