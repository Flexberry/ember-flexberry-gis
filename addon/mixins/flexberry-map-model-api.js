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
    Creates new layer with specified options.
    @method createNewLayer.
  */
  createNewLayer(options) {
    options = options || {};
    const store = this.get('store');
    let layer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', options);
    layer.set('map', this);
    return layer.save().then(()=> {
      const layers = this.get('hierarchy');
      layers.addObject(layer);
      return layer.get('id');
    });
  },

  /**
    Remove shape from layer.

    @method deleteLayerObject.
    @param {String} layerId Id layer.
    @param {String} objectId Id shape.
    @return {Promise} Return target object.
  */
  deleteLayerObject(layerId, objectId) {
    return this.deleteLayerObjects(layerId, [objectId]);
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {String} layerId Id layer.
    @param {OBject[]} objectIds Array of id shapes.
  */
  deleteLayerObjects(layerId, objectIds) {
    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    let ids = [];
    layer._leafletObject.eachLayer(function (shape) {
      let id;
      const getLayerObjectIdFunc = this.get('mapApi').getFromApi('getLayerObjectId');
      if (typeof getLayerObjectIdFunc === 'function') {

        //Need to implement id definition function
        id = getLayerObjectIdFunc(layer, shape);
      } else {
        id = Ember.get(shape, 'feature.id');
      }

      if (!Ember.isNone(id) && objectIds.indexOf(id) !== -1) {
        ids.push(id);
        layer._leafletObject.removeLayer(shape);
      }
    }.bind(this));

    const deleteLayerFromAttrPanelFunc = this.get('mapApi').getFromApi('_deleteLayerFromAttrPanel');
    ids.forEach((id) => {
      if (typeof deleteLayerFromAttrPanelFunc === 'function') {
        deleteLayerFromAttrPanelFunc(id);
      }
    });

    return new Ember.RSVP.Promise((resolve, reject) => {
      const saveSuccess = (data) => {
        layer._leafletObject.off('save:failed', saveSuccess);
        resolve(data);
      };

      const saveFailed = (data) => {
        layer._leafletObject.off('save:success', saveSuccess);
        reject(data);
      };

      layer._leafletObject.once('save:success', saveSuccess);
      layer._leafletObject.once('save:failed', saveFailed);
      layer._leafletObject.save();
    });
  },

  /**
    Gets intersected objects.
    @method getIntersectionObjects
    @param {String} objectId object id with which we are looking for intersections
    @param {Array} layerIds array of layers ids
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
              let intersectionResult;
              if (Ember.get(object, 'feature.id') !== objectId) {
                intersectionResult = lineIntersect(objectToSearch.feature, Ember.get(object, 'feature'));
              }

              if (intersectionResult && intersectionResult.features.length > 0) {
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
