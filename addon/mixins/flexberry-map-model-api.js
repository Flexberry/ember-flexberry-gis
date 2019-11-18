import Ember from 'ember';
import lineIntersect from 'npm:@turf/line-intersect';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
import booleanContains from 'npm:@turf/boolean-contains';
import area from 'npm:@turf/area';
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

    @method hideLayers.
  */
  hideLayers(layerIds) {
    this._setVisibility(layerIds);
  },

  /**
    Shows id objects for layer.

    @method showLayerObjects
    @param {string} layerId Layer id.
    @param {string[]} objectIds Array of id objects.
  */
  showLayerObjects(layerId, objectIds) {
    this._setVisibilityObjects(layerId, objectIds, true);
  },

  /**
    Hides id objects for layer.

    @method hideLayerObjects
    @param {string} layerId Layer id.
    @param {string[]} objectIds Array of id objects.
  */
  hideLayerObjects(layerId, objectIds) {
    this._setVisibilityObjects(layerId, objectIds, false);
  },

  /**
    Show all layer objects.

    @method showAllLayerObjects
    @param {string} layerId Layer id.
  */
  showAllLayerObjects(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    const leafletObject = Ember.get(layer, '_leafletObject');
    var map = Ember.get(leafletObject, '_map');

    leafletObject.eachLayer(function (layerShape) {
      if (!map.hasLayer(layerShape)) {
        map.addLayer(layerShape);
      }
    });
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
    return layer.save().then(() => {
      const layers = this.get('hierarchy');
      layers.addObject(layer);
      return layer.get('id');
    });
  },

  /**
    Remove shape from layer.

    @method deleteLayerObject.
    @param {String} layerId Id layer.
    @param {String} featureId Id shape.
    @return {Promise} Return target feature.
  */
  deleteLayerObject(layerId, featureId) {
    return this.deleteLayerObjects(layerId, [featureId]);
  },

  /**
    Remove shapes from layer.

    @method deleteLayerObjects.
    @param {string} layerId Id layer.
    @param {Object[]} featureIds Array of id shapes.
  */
  deleteLayerObjects(layerId, featureIds) {
    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    if (Ember.isNone(layer)) {
      return new Ember.RSVP.Promise(() => {
        throw new Error(`Layer '${layerId}' not found.`);
      });
    }

    if (Ember.isNone(layer._leafletObject)) {
      return new Ember.RSVP.Promise(() => {
        throw new Error('Layer type not supported');
      });
    }

    let ids = [];
    layer._leafletObject.eachLayer(function (shape) {
      const id = this._getLayerFeatureId(layer, shape);

      if (!Ember.isNone(id) && featureIds.indexOf(id) !== -1) {
        ids.push(id);
        layer._leafletObject.removeLayer(shape);
      }
    }.bind(this));

    const deleteLayerFromAttrPanelFunc = this.get('mapApi').getFromApi('_deleteLayerFromAttrPanel');
    ids.forEach((id) => {
      if (typeof deleteLayerFromAttrPanelFunc === 'function') {
        deleteLayerFromAttrPanelFunc(id, layer);
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
    Gets intersected features.
    @method getIntersectionObjects
    @param {string} featureId feature id with which we are looking for intersections
    @param {number[]} layerIds array of layers ids
  */
  getIntersectionObjects(featureId, layerIds) {
    let result = [];
    let featureToSearch;
    if (Ember.isArray(layerIds)) {
      const allLayers = this.get('mapLayer');
      let layers = Ember.A(allLayers);
      layers.find(layer => {
        let features = Ember.get(layer, '_leafletObject._layers');
        if (!Ember.isNone(features)) {
          featureToSearch = Object.values(features).find(feature => {
            if (this._getLayerFeatureId(layer, feature) === featureId) {
              return true;
            }
          });

          if (featureToSearch) {
            return true;
          }
        }
      });
      if (!Ember.isNone(featureToSearch)) {
        layerIds.forEach(id => {
          let intersectedFeaturesCollection = [];
          const layer = layers.findBy('id', id);
          let features = Ember.get(layer, '_leafletObject._layers');
          if (features) {
            Object.values(features).forEach(feature => {
              let intersectionResult;
              const layerFeatureId = this._getLayerFeatureId(layer, feature);
              if (layerFeatureId !== featureId) {
                intersectionResult = lineIntersect(featureToSearch.feature, Ember.get(feature, 'feature'));
              }

              if (intersectionResult && intersectionResult.features.length > 0) {
                intersectedFeaturesCollection.push(layerFeatureId);
              }
            });
          }

          if (intersectedFeaturesCollection.length > 0) {
            result.push({ id: id, intersected_features: intersectedFeaturesCollection });
          }
        });
      }
    }

    return result;
  },

  /**
    Get the closest object
    @method getNearObject
    @param {string} layerId Layer id of the selected object.
    @param {string} layerObjectId Id of the selected object.
    @param {number[]} layerIdsArray Array of id of layers in which to search.
    @return {Object} Id of the nearest object.
  */
  getNearObject(layerId, layerObjectId, layerIdsArray) {
    const layers = this.get('mapLayer');
    const layer = layers.findBy('id', layerId);

    if (Ember.isNone(layer)) {
      throw `Layer '${layerId}' not found.`;
    }

    var result = null;
    layerIdsArray.forEach(lid => {
      const layer = layers.findBy('id', lid);
      if (Ember.isNone(layer)) {
        throw `Layer '${lid}' not found.`;
      }

      const features = Ember.get(layer, '_leafletObject');
      if (Ember.isNone(features)) {
        throw `There are no objects in the '${lid}' layer.`;
      }

      features.eachLayer(obj => {
        const id = this._getLayerFeatureId(layer, obj);
        const distance = this.getDistanceBetweenObjects(layerId, layerObjectId, lid, id);

        if (layerId === lid && layerObjectId === id) {
          return;
        }

        if (Ember.isNone(result) || distance < result.distance) {
          result = {
            distance: distance,
            layer: layer,
            object: obj,
          };
        }
      });
    });

    return result;
  },

  /**
    Get distance between objects
    @method getDistanceBetweenObjects
    @param {string} firstLayerId First layer id.
    @param {string} firstLayerObjectId First layer object id.
    @param {string} secondLayerId Second layer id.
    @param {string} secondLayerObjectId Second layer object id.
    @return {number} Distance between objects in meters.
  */
  getDistanceBetweenObjects(firstLayerId, firstLayerObjectId, secondLayerId, secondLayerObjectId) {
    const layers = this.get('mapLayer');
    const firstLayer = layers.findBy('id', firstLayerId);
    if (Ember.isNone(firstLayer)) {
      throw `Layer '${firstLayerId}' not found.`;
    }

    const secondLayer = layers.findBy('id', secondLayerId);
    if (Ember.isNone(secondLayer)) {
      throw `Layer '${secondLayerId}' not found.`;
    }

    const getObjectCenter = function (layer, objectId) {
      var result;
      const features = Ember.get(layer, '_leafletObject');
      if (Ember.isNone(features)) {
        throw `There are no objects in the '${layer.id}' layer.`;
      }

      features.eachLayer(obj => {
        const id = this._getLayerFeatureId(layer, obj);

        if (id === objectId) {
          result = obj;
          return;
        }
      });

      if (Ember.isNone(result)) {
        throw `Object '${objectId}' not found.`;
      }

      const type = Ember.get(result, 'feature.geometry.type');
      if (type === 'Point') {
        return result._latlng;
      } else {
        return result.getBounds().getCenter();
      }
    };

    const firstPoint = getObjectCenter.call(this, firstLayer, firstLayerObjectId);
    const firstObject = helpers.point([firstPoint.lat, firstPoint.lng]);

    const secondPoint = getObjectCenter.call(this, secondLayer, secondLayerObjectId);
    const secondObject = helpers.point([secondPoint.lat, secondPoint.lng]);

    // Get distance in meters.
    return distance.default(firstObject, secondObject, { units: 'kilometers' }) * 1000;
  },

  /**
    Get layer object attributes.
    @method getLayerObjectOptions
    @param {String} layerId Id layer
    @param {String} featureId Id object
  */
  getLayerObjectOptions(layerId, featureId) {
    let result;
    if (Ember.isNone(layerId) || Ember.isNone(featureId)) {
      return result;
    }

    const allLayers = this.get('mapLayer');
    let layers = Ember.A(allLayers);
    const layer = layers.findBy('id', layerId);
    if (Ember.isNone(layer)) {
      return result;
    }

    let features = Ember.get(layer, '_leafletObject._layers') || {};
    let object = Object.values(features).find(feature => {
      return this._getLayerFeatureId(layer, feature) === featureId;
    });

    if (!Ember.isNone(object)) {
      result = Ember.$.extend({}, object.feature.properties);
      result.area = area(object.feature);
    }

    return result;
  },

  /**
    Check if objectA contains object B.
    @method isContainsObject
    @param {String} objectAId id of first object.
    @param {String} layerAId id of first layer.
    @param {String} objectBId id of second object.
    @param {String} layerBId id of second layer.
  */
  isContainsObject(objectAId, layerAId, objectBId, layerBId) {
    let objA;
    let objB;
    const layers = this.get('mapLayer');
    let layerA = layers.findBy('id', layerAId);
    let layerB = layers.findBy('id', layerBId);
    if (layerA && layerB) {
      let featuresA = Ember.get(layerA, '_leafletObject._layers');
      objA = Object.values(featuresA).find(feature => {
        const layerAFeatureId = this._getLayerFeatureId(layerA, feature);
        return layerAFeatureId === objectAId;
      });
      let featuresB = Ember.get(layerB, '_leafletObject._layers');
      objB = Object.values(featuresB).find(feature => {
        const layerBFeatureId = this._getLayerFeatureId(layerB, feature);
        return layerBFeatureId === objectBId;
      });
    }

    if (objA && objB) {
      let featureA = Ember.get(objA, 'feature');
      let featureB = Ember.get(objB, 'feature');
      if (booleanContains(featureB, featureA)) {
        return true;
      }
    }

    return false;
  },

  /**
    Calculate the area of ​​object B that extends beyond the boundaries of object A.
    @method getAreaExtends
    @param {String} objectAId id of first object.
    @param {String} layerAId id of first layer.
    @param {String} objectBId id of second object.
    @param {String} layerBId id of second layer.
  */
  getAreaExtends(objectAId, layerAId, objectBId, layerBId) {
    let objA;
    let objB;
    const layers = this.get('mapLayer');
    let layerA = layers.findBy('id', layerAId);
    let layerB = layers.findBy('id', layerBId);
    if (layerA && layerB) {
      let featuresA = Ember.get(layerA, '_leafletObject._layers');
      objA = Object.values(featuresA).find(feature => {
        const layerAFeatureId = this._getLayerFeatureId(layerA, feature);
        return layerAFeatureId === objectAId;
      });
      let featuresB = Ember.get(layerB, '_leafletObject._layers');
      objB = Object.values(featuresB).find(feature => {
        const layerBFeatureId = this._getLayerFeatureId(layerB, feature);
        return layerBFeatureId === objectBId;
      });
    }

    if (objA && objB) {
      let intersectionRes = intersect(objB.feature, objA.feature);
      if (intersectionRes) {
        let resultArea = area(objB.feature) - area(intersectionRes);
        return resultArea;
      } else {
        return area(objB.feature);
      }
    }

    return 0;
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
    Get object id by object and layer.

    @method _getLayerFeatureId
    @param {Object} layer Layer.
    @param {Object} layerObject Object.
    @return {number} Id object.
  */
  _getLayerFeatureId(layer, layerObject) {
    const getLayerFeatureId = this.get('mapApi').getFromApi('getLayerFeatureId');
    if (typeof getLayerFeatureId === 'function') {
      return getLayerFeatureId(layer, layerObject);
    }

    return Ember.get(layerObject, 'feature.id');
  },

  /**
    Determine the visibility of the specified objects by id for the layer.

    @method _setVisibilityObjects
    @param {string} layerId Layer id.
    @param {string[]} objectIds Array of id objects.
    @param {boolean} [visibility=false] visibility Object Visibility.
  */
  _setVisibilityObjects(layerId, objectIds, visibility = false) {
    if (Ember.isArray(objectIds)) {
      const layer = this.get('mapLayer').findBy('id', layerId);
      const leafletObject = Ember.get(layer, '_leafletObject');

      if (Ember.isNone(leafletObject)) {
        throw 'Layer type not supported';
      }

      var map = Ember.get(leafletObject, '_map');

      leafletObject.eachLayer(function (shape) {
        const id = this._getLayerFeatureId(layer, shape);
        if (!Ember.isNone(id) && objectIds.indexOf(id) !== -1) {
          if (visibility) {
            if (!map.hasLayer(shape)) {
              map.addLayer(shape);
            }
          } else {
            if (map.hasLayer(shape)) {
              map.removeLayer(shape);
            }
          }
        }
      }.bind(this));
    }
  },

  /**
    Move Object From one  layer to another.
    @method moveObjectToLayer
    @param {String} objectId GeoJSON object id
    @param {String} fromLayerId id of layer to remove object
    @param {String} tolayerId  id of layer to add object
  */
  moveObjectToLayer(objectId, fromLayerId, toLayerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let objectToSearch;
      let store = this.get('store');
      let layerFrom = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', fromLayerId);
      let layerTo = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', toLayerId);
      if (layerFrom && layerTo) {
        let features = Ember.get(layerFrom, '_leafletObject._layers');
        if (features) {
          objectToSearch = Object.values(features).find(feature => {
            const layerFeatureId = this._getLayerFeatureId(layerFrom, feature);
            return layerFeatureId === objectId;
          });
        }

        if (objectToSearch) {
          layerFrom._leafletObject.removeLayer(objectToSearch);
          objectToSearch._leaflet_id = null;
          var newObj = this.createGeometryType(objectToSearch, reject);
          if (Ember.isNone(newObj)) {
            reject('unknown geomerty type');
          }

          newObj.options = objectToSearch.options;
          Ember.get(layerTo, '_leafletObject').addLayer(newObj);
          let promiseSaveLayerTo = new Ember.RSVP.Promise((resolve, reject) => {
            const saveSuccess = (data) => {
              layerTo._leafletObject.off('save:failed', saveSuccess);
              resolve(data);
            };

            const saveFailed = (data) => {
              layerTo._leafletObject.off('save:success', saveSuccess);
              reject(data);
            };

            layerTo._leafletObject.once('save:success', saveSuccess);
            layerTo._leafletObject.once('save:failed', saveFailed);
            layerTo._leafletObject.save();
          });
          let promiseSaveLayerFrom = new Ember.RSVP.Promise((resolve, reject) => {
            const saveSuccess2 = (data) => {
              layerFrom._leafletObject.off('save:failed', saveSuccess2);
              resolve(data);
            };

            const saveFailed2 = (data) => {
              layerFrom._leafletObject.off('save:success', saveSuccess2);
              reject(data);
            };

            layerFrom._leafletObject.once('save:success', saveSuccess2);
            layerFrom._leafletObject.once('save:failed', saveFailed2);
            layerFrom._leafletObject.save();
          });
          Ember.RSVP.all([promiseSaveLayerTo, promiseSaveLayerFrom])
            .then(() => {
              resolve('object moved successfully');
            }, () => {
              reject('error while saving layers');
            });
        } else {
          reject('no object with such id');
        }
      } else {
        reject('no layer with such id');
      }
    });
  },

  /**
    Copt Object to layer.
    @method copyObject
    @param {String} objectId GeoJSON object id
    @param {String} fromLayerId GeoJSON object id
    @param {String} toLayerId  id of layer to add object
  */
  copyObject(objectId, fromLayerId, toLayerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let objectToSearch;
      let store = this.get('store');
      let layerFrom = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', fromLayerId);
      let layerTo = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', toLayerId);
      if (layerTo && layerFrom) {
        let features = Ember.get(layerFrom, '_leafletObject._layers');
        if (features) {
          objectToSearch = Object.values(features).find(feature => {
            const layerFeatureId = this._getLayerFeatureId(layerFrom, feature);
            return layerFeatureId === objectId;
          });
        }

        if (objectToSearch) {
          objectToSearch._leaflet_id = null;
          var newObj = this.createGeometryType(objectToSearch);
          if (Ember.isNone(newObj)) {
            reject('unknown geometry type');
          }

          newObj.options = objectToSearch.options;
          Ember.get(layerTo, '_leafletObject').addLayer(newObj);

          const saveSuccess = (data) => {
            layerTo._leafletObject.off('save:failed', saveSuccess);
            resolve(data);
          };

          const saveFailed = (data) => {
            layerTo._leafletObject.off('save:success', saveSuccess);
            reject(data);
          };

          layerTo._leafletObject.once('save:success', saveSuccess);
          layerTo._leafletObject.once('save:failed', saveFailed);
          layerTo._leafletObject.save();
        } else {
          reject('no object with such id');
        }
      } else {
        reject('no layer with such id');
      }
    });
  },

  /**
    Create new Lealfet object according to objectToDefine geometry type.
    @method  createGeometryType
    @param {String} objectToDefine GeoJSON object.
  */
  createGeometryType(objectToDefine) {
    switch (Ember.get(objectToDefine, 'feature.geometry.type')) {
      case 'Marker':
        return L.marker(objectToDefine.getLatLng());
      case 'Circle':
        return L.circle(objectToDefine.getLatLng(), objectToDefine.getRadius());
      case 'LineString':
        return L.polyline(objectToDefine.getLatLngs());
      case 'MultiLineString':
        return L.polyline(objectToDefine.getLatLngs());
      case 'Polygon':
        return L.polygon(objectToDefine.getLatLngs());
      case 'MultiPolygon':
        return L.polygon(objectToDefine.getLatLngs());
      default: return undefined;
    }
  },

  /**
    Create image for layer object.
    @method  getSnapShot
  */
  getSnapShot(layerId, objectId, layerArrIds) {
    let store = this.get('store');
    let layer = this.get('mapLayer').findBy('id', layerId);

    let allLayers = this.get('mapLayer.canonicalState');
    let allLayersIds = [];

    allLayers.forEach(function(i) {
      allLayersIds.push(i.id);
    });

    let showLayersIds = layerArrIds;
    showLayersIds.push(layerId, this.get('id'));
    this.showLayers(showLayersIds);

    Array.prototype.diff = function(a) {
      return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    let hideLayersIds = allLayersIds.diff(showLayersIds);
    this.hideLayers(hideLayersIds);

    let objectIds = [];
    objectIds.push(objectId);
    this.showLayerObjects(layerId, objectIds);

    let objectToSearch;

    let layerFrom = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', layerId);
    let layerTo = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', layerId);
    if (layerFrom && layerTo) {
      let features = Ember.get(layerFrom, '_leafletObject._layers');
      if (features) {
        objectToSearch = Object.values(features).find(feature => {
          let layerFeatureId = this._getLayerFeatureId(layerFrom, feature);
          return layerFeatureId === objectId;
        });
      }
    }

    const leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let bounds = layer.get('_leafletObject').getBounds();

    if (!Ember.isNone(bounds)) {
      leafletMap.fitBounds(bounds.pad(1));
    }

    leafletMap.once('moveend', () => {
      this.downloadSnapShot();
    });
  },

  /**
    Download image for layer object.
    @method  downloadSnapShot
  */
  downloadSnapShot() {
    const leafletMap = this.get('mapApi').getFromApi('leafletMap');
    document.getElementsByClassName('leaflet-control-zoom leaflet-bar leaflet-control')[0].style.display = 'none';
    document.getElementsByClassName('history-control leaflet-bar leaflet-control horizontal')[0].style.display = 'none';
    let $mapPicture = Ember.$(leafletMap._container);

    let canvas = window.html2canvas($mapPicture[0], {
      useCORS: true
    }).then((canvas) => {
      let type = 'image/png';
      let canvasPic =  {
        data: canvas.toDataURL(type),
        width: canvas.width,
        height: canvas.height,
        type: type
      };
      saveAs(canvasPic.data, 'map.png');
      document.getElementsByClassName('leaflet-control-zoom leaflet-bar leaflet-control')[0].style.display = 'block';
      document.getElementsByClassName('history-control leaflet-bar leaflet-control horizontal')[0].style.display = 'block';
    });

    function saveAs(uri, filename) {
      var link = document.createElement('a');
      if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;

        //Firefox requires the link to be in the body
        document.body.appendChild(link);

        //simulate click
        link.click();

        //remove the link when done
        document.body.removeChild(link);
      } else {
        window.open(uri);
      }
    }
  },
});