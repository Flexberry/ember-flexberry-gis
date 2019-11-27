import Ember from 'ember';
import lineIntersect from 'npm:@turf/line-intersect';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
import booleanContains from 'npm:@turf/boolean-contains';
import area from 'npm:@turf/area';
import intersect from 'npm:@turf/intersect';
import projection from 'npm:@turf/projection';
import rhumbBearing from 'npm:@turf/rhumb-bearing';
import rhumbDistance from 'npm:@turf/rhumb-distance';

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
  */
  deleteLayerObject(layerId, featureId) {
    this.deleteLayerObjects(layerId, [featureId]);
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
      throw new Error(`Layer '${layerId}' not found.`);
    }

    const leafletObject = Ember.get(layer, '_leafletObject');
    if (Ember.isNone(leafletObject)) {
      throw new Error('Layer type not supported');
    }

    let ids = [];
    leafletObject.eachLayer(function (shape) {
      const id = this._getLayerFeatureId(layer, shape);

      if (!Ember.isNone(id) && featureIds.indexOf(id) !== -1) {
        ids.push(id);
        leafletObject.removeLayer(shape);
      }
    }.bind(this));

    const deleteLayerFromAttrPanelFunc = this.get('mapApi').getFromApi('_deleteLayerFromAttrPanel');
    ids.forEach((id) => {
      if (typeof deleteLayerFromAttrPanelFunc === 'function') {
        deleteLayerFromAttrPanelFunc(id, layer);
      }
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
      const layers = this.get('mapLayer');
      const layer = layers.findBy('id', layerId);
      if (Ember.isNone(layer)) {
        throw 'No layer with such id';
      }

      const leafletObject = Ember.get(layer, '_leafletObject');

      if (Ember.isNone(leafletObject)) {
        throw 'Layer type not supported';
      }

      const map = this.get('mapApi').getFromApi('leafletMap');

      objectIds.forEach(objectId => {
        let object = Object.values(leafletObject._layers).find(shape => {
          return Ember.get(shape, 'feature.properties.primarykey') === objectId;
        });
        if (object) {
          if (visibility) {
            map.addLayer(object);
          } else {
            map.removeLayer(object);
          }
        }
      });
    }
  },

  /**
    Copy Object from Source layer to Destination.
    @method copyObject
    @param {Object} source Object with source settings
    {
      layerId,
      objectId,
      shouldRemove
    }
    @param {Object} destination Object with destination settings
    {
      layerId,
      properties
    }
  */
  copyObject(source, destination) {
    let [sourceLayerModel, sourceLeafletLayer, sourceFeature] = this._getModelLayerFeature(source.layerId, source.objectId);
    let [destLayerModel, destLeafletLayer] = this._getModelLayerFeature(destination.layerId);
    if (sourceLayerModel && destLayerModel && sourceLeafletLayer && destLeafletLayer && sourceFeature) {
      let destFeature;
      switch (destLayerModel.get('settingsAsObject.typeGeometry')) {
        case 'polygon':
          destFeature = L.polygon(sourceFeature.getLatLngs());
          break;
        case 'polyline':
          destFeature = L.polyline(sourceFeature.getLatLngs());
          break;
        case 'marker':
          destFeature = L.marker(sourceFeature.getLatLng());
          break;
        default:
          throw 'Unknown layer type: ' + destLayerModel.get('settingsAsObject.typeGeometry');
      }

      destFeature.feature = {
        properties: Object.assign({}, sourceFeature.feature.properties, destination.properties || {})
      };

      destLeafletLayer.addLayer(destFeature);

      if (source.shouldRemove) {
        sourceLeafletLayer.removeLayer(sourceFeature);
      }
    } else {
      throw {
        message: 'Wrong parameters',
        sourceLayerModel,
        sourceLeafletLayer,
        sourceFeature,
        destLayerModel,
        destLeafletLayer
      };
    }
  },

  /**
    Calculate the area of intersection between object A and object B .
    @method getIntersectionArea
    @param {String} objectAId id of first object.
    @param {String} layerAId id of first layer.
    @param {String} objectBId id of second object.
    @param {String} layerBId id of second layer.
    @param {Bool} showOnMap flag indicates if intersection area will be displayed on map.
  */
  getIntersectionArea(layerAId, objectAId, layerBId, objectBId, showOnMap) {
    let [layerA, layerObjectA, objA] = this._getModelLayerFeature(layerAId, objectAId);
    let [layerB, layerObjectB, objB] = this._getModelLayerFeature(layerBId, objectBId);
    if (layerObjectA && layerObjectB) {
      if (layerA && layerB) {
        if (objA && objB) {
          return new Ember.RSVP.Promise((resolve, reject) => {
            objA = objA.options.crs.code === 'EPSG:4326' ? objA.feature : projection.toWgs84(objA.feature);
            objB = objB.options.crs.code === 'EPSG:4326' ? objB.feature : projection.toWgs84(objB.feature);
            let intersectionRes = intersect.default(objA, objB);
            if (intersectionRes) {
              if (showOnMap) {
                let obj = L.geoJSON(intersectionRes, {
                  style: { color: 'green' }
                });
                let serviceLayer = this.get('mapApi').getFromApi('serviceLayer');
                obj.addTo(serviceLayer);
                resolve('displayed');
              }

              resolve(area(intersectionRes));
            } else {
              reject('no intersection found');
            }
          });
        } else {
          throw 'no object with such id';
        }
      } else {
        throw 'no layer with such id';
      }
    }
  },

  /**
    Cleans the service layer.
    @method clearServiceLayer
  */
  clearServiceLayer() {
    let serviceLayer = this.get('mapApi').getFromApi('serviceLayer');
    serviceLayer.clearLayers();
  },

  /**
    Create image for layer object.
    @method  getSnapShot
    @snapt
  */
  getSnapShot({ layerId, objectId, layerArrIds, options }) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let [layerModel, leafletLayer, featureLayer] = this._getModelLayerFeature(layerId, objectId);
      if (layerModel && leafletLayer && featureLayer) {
        if (layerArrIds) {
          let allLayers = this.get('mapLayer.canonicalState');
          let allLayersIds = allLayers.map((l) => l.id);

          let showLayersIds = layerArrIds;
          showLayersIds.push(layerId);

          this.showLayers(showLayersIds);
          let hideLayersIds = allLayersIds.filter((i) => { return showLayersIds.indexOf(i) < 0; });
          this.hideLayers(hideLayersIds);
        }

        const leafletMap = this.get('mapApi').getFromApi('leafletMap');

        leafletMap.once('moveend', () => {
          Ember.run.later(() => {
            document.getElementsByClassName('leaflet-control-zoom leaflet-bar leaflet-control')[0].style.display = 'none';
            document.getElementsByClassName('history-control leaflet-bar leaflet-control horizontal')[0].style.display = 'none';
            let $mapPicture = Ember.$(leafletMap._container);

            let html2canvasOptions = Object.assign({
              useCORS: true
            }, options);
            window.html2canvas($mapPicture[0], html2canvasOptions)
              .then((canvas) => {
                let type = 'image/png';
                var image64 = canvas.toDataURL(type);
                resolve(image64);
              })
              .catch((e) => reject(e))
              .finally(() => {
                document.getElementsByClassName('leaflet-control-zoom leaflet-bar leaflet-control')[0].style.display = 'block';
                document.getElementsByClassName('history-control leaflet-bar leaflet-control horizontal')[0].style.display = 'block';
              });
          });
        });

        let bounds = featureLayer.getBounds();
        if (!Ember.isNone(bounds)) {
          leafletMap.fitBounds(bounds);
        }
      } else {
        throw {
          message: 'Wrong parameters',
          layerModel,
          leafletLayer,
          featureLayer
        };
      }
    });
  },

  /**
    Download image for layer object.
    @method  downloadSnapShot
  */
  downloadSnapShot({ layerId, objectId, layerArrIds, options, fileName }) {
    this.getSnapShot({ layerId, objectId, layerArrIds, options }).then((uri) => {
      var link = document.createElement('a');
      if (typeof link.download === 'string') {
        link.href = uri;
        link.download = fileName;

        //Firefox requires the link to be in the body
        document.body.appendChild(link);

        //simulate click
        link.click();

        //remove the link when done
        document.body.removeChild(link);
      } else {
        window.open(uri);
      }
    });
  },

  /**
   * Get the object thumb.
   * @method  getRhumb
   * @param {string} layerId Layer id.
   * @param {string} objectId Object id.
   * @return {array} Table rhumb.
  */
  getRhumb(layerId, objectId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    const leafletObject = Ember.get(layer, '_leafletObject');

    var cors;
    leafletObject.eachLayer(function (object) {
      const id = this._getLayerFeatureId(layer, object);
      if (!Ember.isNone(id) && objectId === id) {
        cors = object._latlngs;
      }
    }.bind(this));

    if (Ember.isNone(cors)) {
      throw new Error('Object not found');
    }

    let result = [];

    var rowPush = function (vertexNum1, vertexNum2, point1, point2) {
      const pointFrom = helpers.point([point2.lat, point2.lng]);
      const pointTo = helpers.point([point1.lat, point1.lng]);

      // We get the distance and translate into meters.
      const distance = rhumbDistance.default(pointFrom, pointTo, { units: 'kilometers' }) * 1000;

      // Get the angle.
      const bearing = rhumbBearing.default(pointFrom, pointTo);

      let rhumb;

      // Calculates rhumb.
      if (bearing < -90 && bearing > -180) {
        // СВ
        rhumb = 'СВ;' + (Math.abs(bearing) - 90);
      } else if (bearing <= 180 && bearing > 90) {
        // ЮВ
        rhumb = 'ЮВ;' + (bearing - 90);
      } else if (bearing <= 90 && bearing > 0) {
        // ЮЗ
        rhumb = 'ЮЗ;' + (90 - bearing);
      } if (bearing <= 0 && bearing >= -90) {
        // СЗ
        rhumb = 'СЗ;' + Math.abs(-90 - bearing);
      }

      return {
        rib: `${vertexNum1 + 1};${vertexNum2 + 1}`,
        rhumb: rhumb,
        distance: distance
      };
    };

    let startPoint = null;
    for (let i = 0; i < cors.length; i++) {
      for (let j = 0; j < cors[i].length; j++) {
        let n;
        let point1;
        let point2;
        let item = cors[i][j];

        // Polygon.
        if (!Ember.isNone(item.length)) {
          for (let k = 0; k < item.length; k++) {
            startPoint = k === 0 ? item[k] : startPoint;
            point1 = item[k];
            n = !Ember.isNone(item[k + 1]) ? k + 1 : 0;
            point2 = item[n];

            result.push(rowPush(k, n, point1, point2));
          }

          // LineString.
        } else {
          startPoint = j === 0 ? item : startPoint;
          point1 = item;
          n = !Ember.isNone(cors[i][j + 1]) ? j + 1 : 0;
          point2 = cors[i][n];

          result.push(rowPush(j, n, point1, point2));
        }
      }
    }

    return {
      startPoint: startPoint,
      coordinates: result
    };
  },

  /**
    Add a layer to the group.

    @method layerToGroup
    @parm {string} layerGroupId Group layer id.
    @parm {string} layerId layer id.
  */
  layerToGroup(layerGroupId, layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);

    let layerModel = this._getLayerModel(layerGroupId);
    layerModel.set('parent', layer);
  }

});
