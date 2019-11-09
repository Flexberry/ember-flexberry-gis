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
    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    if (Ember.isNone(layer)) {
      return new Ember.RSVP.Promise(() => {
        throw new Error(`Layer '${layerId}' not found.`);;
      });
    }

    const leafletObject = Ember.get(layer, '_leafletObject');

    if (Ember.isNone(leafletObject)) {
      return new Ember.RSVP.Promise(() => {
        throw new Error('Layer type not supported');
      });
    }

    if (Object.keys(leafletObject.changes).length === 0) {
      return new Ember.RSVP.Promise(() => {
        throw new Error('No changed objects');
      });
    }

    return new Ember.RSVP.Promise((resolve, reject) => {
      const saveSuccess = (data) => {
        Ember.set(leafletObject, '_wasChanged', false);
        const map = Ember.get(leafletObject, '_map');

        // Remove layer editing.
        this.disableLayerEditing(map);

        leafletObject.off('save:failed', saveFailed);
        resolve(data);
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
