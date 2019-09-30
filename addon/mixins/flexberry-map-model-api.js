import Ember from 'ember';

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

  /**
    Remove shape from layer.

    @method deleteLayerObject.
    @param {String} layerId Id layer.
    @param {String} objectId Id shape.
  */
  deleteLayerObject(layerId, objectId) {
    this.deleteLayerObjects(layerId, [objectId]);
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {String} layerId Id layer.
    @param {OBject[]} objectIds Array of id shapes.
  */
  deleteLayerObjects(layerId, objectIds) {
    const layers = this.get('mapLayer');
    var layer = layers.findBy('id', layerId);

    let layerShapes = layer._leafletObject._layers;
    let ids = [];

    layer._leafletObject.eachLayer(function (shape) {
      let id = Ember.get(shape, 'feature.id');
      if (Ember.isNone(id)) {
        const getLayerObjectId = this.get('mapApi').getFromApi('getLayerObjectId');
        if (typeof getLayerObjectId === 'function') {

          //Need to implement id definition function
          id = getLayerObjectId(shape);
        }
      }

      if (!Ember.isNone(id) && objectIds.indexOf(id) !== -1) {
        ids.push(id);
        layer._leafletObject.removeLayer(shape);
      }
    }.bind(this));

    let saveSuccess = (data) => {
      const deleteLayerFromAttrPanel = this.get('mapApi').getFromApi('_deleteLayerFromAttrPanel');
      ids.forEach((id) => {
        if (typeof deleteLayerFromAttrPanel === 'function') {
          deleteLayerFromAttrPanel(id);
        }
      });
    };

    layer._leafletObject.once('save:success', saveSuccess);
    layer._leafletObject.save();
  }
});
