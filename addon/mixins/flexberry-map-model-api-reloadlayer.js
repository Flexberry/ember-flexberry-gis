import { isNone } from '@ember/utils';
import { all, Promise } from 'rsvp';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  reloadLayers(layersIds) {
    return all(layersIds.map((layerId) => this.reloadLayer(layerId)));
  },

  /**
    Reload layer.
    @method reloadLayer
    @param {string} layerId Layer id.
    @throws {Error}
    @return {Ember.RSVP.Promise} Returns promise.
  */
  reloadLayer(layerId) {
    const [, leafletObject] = this._getModelLeafletObject(layerId);

    if (isNone(leafletObject)) {
      return new Promise(() => {
        throw new Error('Layer type not supported');
      });
    }

    return leafletObject.reload();
  },
});
