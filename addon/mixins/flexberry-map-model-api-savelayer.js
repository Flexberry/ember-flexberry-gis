import Ember from 'ember';

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
      let promise = new Ember.RSVP.Promise((resolve, reject) => {
        leafletObject.once('loadCompleted', () => {
          resolve();
        }).once('error', (e) => {
          leafletObject.existingFeaturesLoaded = false;
          reject();
        });
      });
      const saveSuccess = (data) => {
        Ember.set(leafletObject, '_wasChanged', false);
        this._getEditTools().featuresLayer.clearLayers();
        const map = this.get('mapApi').getFromApi('leafletMap');

        if (!Ember.isNone(map)) {
          // Remove layer editing.
          this.disableLayerEditing(map);
        }

        leafletObject.off('save:failed', saveFailed);
        let result = {
          layerModel,
          newFeatures: data.layers
        };
        if (data.layers.length === 0) {
          resolve(result);
        } else {
          promise.then(() => {
            resolve(result);
          });
        }
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
