import Ember from 'ember';
import WfsLayer from '../layers/wfs';

export default Ember.Mixin.create({
  saveLayers(layersIds) {
    return Ember.RSVP.all(layersIds.map((layerId) => this.saveLayer(layerId)));
  },

  /**
    Save layer.
    @method saveLayer
    @param {string} layerId Layer id.
    @throws {Error}
    @return {Ember.RSVP.Promise} Returns promise.
  */
  saveLayer(layerId) {
    let [layerModel, leafletObject] = this._getModelLeafletObject(layerId);

    if (Ember.isNone(leafletObject)) {
      return new Ember.RSVP.Promise(() => {
        throw new Error('Layer type not supported');
      });
    }

    return new Ember.RSVP.Promise((resolve, reject) => {
      const saveSuccess = (data) => {
        Ember.set(leafletObject, '_wasChanged', false);
        const map = Ember.get(leafletObject, '_map');

        if (!Ember.isNone(map)) {
          // Remove layer editing.
          this.disableLayerEditing(map);
        }

        let className = Ember.get(layerModel, 'type');
        let layerType = Ember.getOwner(this).knownForType('layer', className);
        if (layerType instanceof WfsLayer) {
          Object.values(leafletObject.changes).forEach(item => {
            if (item.state === 'updateElement') {
              let filter = new L.Filter.EQ('primarykey', Ember.get(item, 'feature.properties.primarykey'));
              map.removeLayer(item);
              leafletObject.loadFeatures(filter);
              let id = leafletObject.getLayerId(item);
              delete leafletObject._layers[id];
            }
          });
        }

        leafletObject.off('save:failed', saveFailed);
        resolve({
          layerModel,
          newFeatures: data.layers
        });
      };

      const saveFailed = (data) => {
        leafletObject.off('save:success', saveSuccess);
        reject(data);
      };

      leafletObject.once('save:success', saveSuccess);
      leafletObject.once('save:failed', saveFailed);
      leafletObject.save();
    });
  },

  /**
    Remove layer editing.
    @method _removeLayerEditing
    @param {Object} map Map.
    @private
  */
  disableLayerEditing(map) {
    map.eachLayer(function (object) {
      let enabled = Ember.get(object, 'editor._enabled');
      if (enabled === true) {
        object.disableEdit();
      }
    });
    map.off('editable:editing');
  }
});
