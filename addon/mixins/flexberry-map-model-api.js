import Ember from 'ember';
import intersect from 'npm:@turf/intersect';

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
    Gets intersected objects.

    @method  getIntersectionObjects
    @param {string} objectId object id with which we are looking for intersections
    @param {Array} layerIds  array of layers ids
  */
  getIntersectionObjects(objectId, layerIds) {
    let result = [];
    let objectToSearch;
    if (Ember.isArray(layerIds)) {
      const allLayers = this.get('mapLayer');
      let layers = Ember.A(allLayers);
      layers.find(layer => {
        let features = Ember.get(layer, '_leafletObject._layers');
        if (!Ember.isNone(features)) {
          Object.values(features).forEach(object=> {
            if (object.hasOwnProperty('window.mapApi.getLayerObjectId')) {
              if (this.get('mapApi').getFromApi('getLayerObjectId')(object) === objectId) {
                objectToSearch = object;
              }
            } else {
              if (Ember.get(object, 'feature.id') === objectId) {
                objectToSearch = object;
              }
            }
          });
        }
      });
      if (!Ember.isNone(objectToSearch)) {
        layerIds.forEach(id => {
          let intersectedObjectsCollection = [];
          const layer = layers.findBy('id', id);
          let features = Ember.get(layer, '_leafletObject._layers');
          if (features) {
            Object.values(features).forEach(object=> {
              let intersectionResult = intersect(objectToSearch.feature, Ember.get(object, 'feature'));
              if (intersectionResult) {
                if (object.hasOwnProperty('window.mapApi.getLayerObjectId')) {
                  intersectedObjectsCollection.push(this.get('mapApi').getFromApi('getLayerObjectId')(object));
                } else {
                  intersectedObjectsCollection.push(Ember.get(object, 'feature.id'));
                }
              }
            });
          }

          if (intersectedObjectsCollection.length > 0) {
            result.push({ id: id, intersected_objects: intersectedObjectsCollection });
          }
        });
      }
    }

    return result;
  }
});
