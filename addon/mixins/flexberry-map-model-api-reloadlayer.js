import Ember from 'ember';

export default Ember.Mixin.create({
  reloadLayers(layersIds) {
    return Ember.RSVP.all(layersIds.map((layerId) => this.reloadLayer(layerId)));
  },

  /**
    Reload layer.
    @method reloadLayer
    @param {string} layerId Layer id.
    @throws {Error}
    @return {Ember.RSVP.Promise} Returns promise.
  */
  reloadLayer(layerId) {
    let [, leafletObject] = this._getModelLeafletObject(layerId);

    if (Ember.isNone(leafletObject)) {
      return new Ember.RSVP.Promise(() => {
        throw new Error('Layer type not supported');
      });
    }

    return leafletObject.reload();
  }
});
