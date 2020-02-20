import Ember from 'ember';
import lineIntersect from 'npm:@turf/line-intersect';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
import booleanContains from 'npm:@turf/boolean-contains';
import area from 'npm:@turf/area';
import intersect from 'npm:@turf/intersect';
import rhumbBearing from 'npm:@turf/rhumb-bearing';
import rhumbDistance from 'npm:@turf/rhumb-distance';
import { getLeafletCrs } from '../utils/leaflet-crs';
import VectorLayer from '../layers/-private/vector';

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
    Hide all layer objects.

    @method hideAllLayerObjects
    @param {string} layerId Layer id.
  */
  hideAllLayerObjects(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    const leafletObject = Ember.get(layer, '_leafletObject');
    var map = Ember.get(leafletObject, '_map');

    leafletObject.eachLayer(function (layerShape) {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
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
          let className = Ember.get(layer, 'type');
          let layerType = Ember.getOwner(this).knownForType('layer', className);
          if (layerType instanceof VectorLayer) {
            let features = Ember.get(layer, '_leafletObject._layers');
            if (features) {
              Object.values(features).forEach(feature => {
                let intersectionResult;
                const layerFeatureId = this._getLayerFeatureId(layer, feature);
                if (layerFeatureId !== featureId) {
                  let objA = featureToSearch;
                  let objB = feature;
                  objA = objA.options.crs.code === 'EPSG:4326' ? objA.feature : this._convertObjectCoordinates(objA).feature;
                  objB = objB.options.crs.code === 'EPSG:4326' ? objB.feature : this._convertObjectCoordinates(objB).feature;
                  if (objA.geometry.type === 'Polygon' || objA.geometry.type === 'MultiPolygon') {
                    intersectionResult = intersect.default(objA, objB);
                  } else if (objA.geometry.type === 'MultiLineString' || objA.geometry.type === 'LineString') {
                    intersectionResult = lineIntersect(objA, objB);
                  }
                }

                if (intersectionResult) {
                  intersectedFeaturesCollection.push(layerFeatureId);
                }
              });
            }
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
    let [, layerObjectA, objA] = this._getModelLayerFeature(firstLayerId, firstLayerObjectId);
    let [, layerObjectB, objB] = this._getModelLayerFeature(secondLayerId, secondLayerObjectId);
    if (layerObjectA && objA && layerObjectB && objB) {
      const getObjectCenterPoint = function (object) {       
        let type = Ember.get(object, 'feature.geometry.type');
        if (type === 'Point') {
          return helpers.point([object._latlng.lat, object._latlng.lng]);
        } else {
          let latlngs = object.getBounds().getCenter();
          return helpers.point([latlngs.lat, latlngs.lng]);
        }
      };
      const firstObject =  getObjectCenterPoint.call(this, objA);
      const secondObject = getObjectCenterPoint.call(this, objB);

      // Get distance in meters.
      return distance.default(firstObject, secondObject, { units: 'kilometers' }) * 1000;
    } else {
      throw 'Object not found';
    }   
  },

  /**
    Get layer object attributes.
    @method getLayerObjectOptions
    @param {String} layerId Id layer
    @param {String} featureId Id object
    @param {String} crsName crs name, in which to give coordinates
  */
  getLayerObjectOptions(layerId, featureId, crsName) {
    let result;  
    let  [, leafletLayer, featureLayer]  = this._getModelLayerFeature(layerId, featureId);
    if (leafletLayer && featureLayer) {
      result = Ember.$.extend({}, featureLayer.feature.properties);
      result.geometry = featureLayer.feature.geometry.coordinates;
      if (crsName) {    
        let NewObjCrs = this._convertObjectCoordinates(featureLayer, crsName);
        result.geometry = NewObjCrs.feature.geometry.coordinates;
      }
      let obj = featureLayer.options.crs.code === 'EPSG:4326' ? featureLayer.feature : this._convertObjectCoordinates(featureLayer).feature;
      result.area = area(obj);
    } 

    return result;   
  },

  /**
    Check if object A contains object B.
    @method isContainsObject
    @param {String} objectAId id of first object.
    @param {String} layerAId id of first layer.
    @param {String} objectBId id of second object.
    @param {String} layerBId id of second layer.
  */
  isContainsObject(objectAId, layerAId, objectBId, layerBId) {
    let  [, leafletLayerA, objA]  = this._getModelLayerFeature(layerAId, objectAId);
    let  [, leafletLayerB, objB]  = this._getModelLayerFeature(layerBId, objectBId);
    if (objA && objB && leafletLayerA && leafletLayerB) {
      let feature1 = objA.options.crs.code === 'EPSG:4326' ? objA.feature : this._convertObjectCoordinates(objA).feature;
      let feature2 = objB.options.crs.code === 'EPSG:4326' ? objB.feature : this._convertObjectCoordinates(objB).feature;
      if (feature1.geometry.type === 'MultiPolygon') {
        feature1 = L.polygon(feature1.geometry.coordinates[0]).toGeoJSON();
      }

      if (feature2.geometry.type === 'MultiPolygon') {
        feature2 = L.polygon(feature2.geometry.coordinates[0]).toGeoJSON();
      }

      if (booleanContains(feature1, feature2)) {
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
    let [, layerObjectA, objA] = this._getModelLayerFeature(layerAId, objectAId);
    let [, layerObjectB, objB] = this._getModelLayerFeature(layerBId, objectBId);

    if (objA && objB && layerObjectA && layerObjectB) {
      let feature1 = objA.options.crs.code === 'EPSG:4326' ? objA.feature : this._convertObjectCoordinates(objA).feature;
      let feature2 = objB.options.crs.code === 'EPSG:4326' ? objB.feature : this._convertObjectCoordinates(objB).feature;
      let intersectionRes = intersect.default(feature2, feature1);
      if (intersectionRes) {
        let resultArea = area(feature2) - area(intersectionRes);
        return resultArea;
      } else {
        return area(feature2);
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
        let objects = Object.values(leafletObject._layers).filter(shape => {
          return this._getLayerFeatureId(layer, shape) === objectId;
        });
        if (objects.length > 0) {
          objects.forEach(obj => {
            if (visibility) {
              map.addLayer(obj);
            } else {
              map.removeLayer(obj);
            }
          });
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
      switch (destLayerModel.get('settingsAsObject.typeGeometry').toLowerCase()) {
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
            let feature1 = objA.options.crs.code === 'EPSG:4326' ? objA.feature : this._convertObjectCoordinates(objA).feature;
            let feature2 = objB.options.crs.code === 'EPSG:4326' ? objB.feature : this._convertObjectCoordinates(objB).feature;
            let intersectionRes = intersect.default(feature1, feature2);
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

        let $mapPicture = Ember.$(leafletMap._container);
        let heightMap = $mapPicture.height();
        let widthMap = $mapPicture.width();
        let heightNew = heightMap;
        let widthNew = widthMap;
        if (!Ember.isNone(options)) {
          heightNew = Ember.isNone(options.height) ? heightMap : options.height;
          widthNew = Ember.isNone(options.width) ? widthMap : options.width;
        }

        $mapPicture.height(heightNew);
        $mapPicture.width(widthNew);

        leafletMap.once('moveend', () => {
          Ember.run.later(() => {
            document.getElementsByClassName('leaflet-control-zoom leaflet-bar leaflet-control')[0].style.display = 'none';
            document.getElementsByClassName('history-control leaflet-bar leaflet-control horizontal')[0].style.display = 'none';
            document.getElementsByClassName('leaflet-control-container')[0].style.display = 'none';

            let html2canvasOptions = Object.assign({
              useCORS: true
            });
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
                document.getElementsByClassName('leaflet-control-container')[0].style.display = 'block';
                $mapPicture.height(heightMap);
                $mapPicture.width(widthMap);
              });
          }, 2000);
        });

        let bounds = featureLayer.getBounds();
        if (!Ember.isNone(bounds)) {
          leafletMap.fitBounds(bounds.pad(1));
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
      const pointFrom = helpers.point([point2.lng, point2.lat]);
      const pointTo = helpers.point([point1.lng, point1.lat]);

      // We get the distance and translate into meters.
      const distance = rhumbDistance.default(pointFrom, pointTo, { units: 'kilometers' }) * 1000;

      // Get the angle.
      const bearing = rhumbBearing.default(pointTo, pointFrom);

      let rhumb;

      // Calculates rhumb.
      if (bearing <= 90 && bearing >= 0) {
        // СВ
        rhumb = 'СВ;' + bearing;
      } else if (bearing <= 180 && bearing >= 90) {
        // ЮВ
        rhumb = 'ЮВ;' + (180 - bearing);
      } else if (bearing >= -180 && bearing <= -90) {
        // ЮЗ
        rhumb = 'ЮЗ;' + (180 + bearing);
      } if (bearing <= 0 && bearing >= -90) {
        // СЗ
        rhumb = 'СЗ;' + (-1 * bearing);
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
      rhumbCoordinates: result,
      coordinates: cors
    };
  },

  /**
    Add a layer to the group.

    @method layerToGroup
    @parm {string} layerGroupId Group layer id.
    @parm {string} layerId layer id.
  */
  moveLayerToGroup(layerId, layerGroupId) {
    const layer = this.get('mapLayer').findBy('id', layerId);

    let layerModel = this.getLayerModel(layerGroupId);
    layerModel.set('parent', layer);
  },

  /**
    Change object polygon.
    @method copyObject
    @param {String} objectId geoJSON object id.
    @param {String} layerId id of layer to change object.
    @param {String} polygon  new object polygon.
    @param {String} crsName  crs name.
  */
  editLayerObject(layerId, objectId, polygon, crsName) {
    if (polygon) {
      let [, leafletLayer, featureLayer] = this._getModelLayerFeature(layerId, objectId);
      if (leafletLayer && featureLayer) {
        let crs = leafletLayer.options.crs;
        if (!Ember.isNone(crsName)) {
          crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
        }

        let coordsToLatLng = function(coords) {
          return crs.unproject(L.point(coords));
        };

        let geoJSON = null;
        if (!Ember.isNone(crs) && crs.code !== 'EPSG:4326') {
          geoJSON = L.geoJSON(polygon, { coordsToLatLng: coordsToLatLng.bind(this) }).getLayers()[0];
        } else {
          geoJSON = L.geoJSON(polygon).getLayers()[0];
        }

        if (!Ember.isNone(Ember.get(geoJSON, 'feature.geometry'))) {
          if (Ember.get(geoJSON, 'feature.geometry.type').toLowerCase() !== 'point') {
            featureLayer.setLatLngs(geoJSON._latlngs);
          } else {
            featureLayer.setLatLng(geoJSON._latlng);
          }

          if (typeof leafletLayer.editLayer === 'function') {
            leafletLayer.editLayer(featureLayer);
            return true;
          }
        } else {
          throw 'unable to convert coordinates for this CRS ' + crsName;
        }
      } else {
        throw 'no object or layer found';
      }
    } else {
      throw 'new object settings not passed';
    }
  },

  /**
    Upload file.
    @method uploadFile
    @param {File} file.
    @return {Promise} Returns promise
  */
  uploadFile(file) {
    let config = Ember.getOwner(this).resolveRegistration('config:environment');

    return Ember.$.ajax({
      url: `${config.APP.backendUrl}/controls/FileUploaderHandler.ashx?FileName=${file.name}`,
      type: 'POST',
      data: file,
      cache: false,
      processData: false
    });
  },

  /**
    Convert coordinates of object to wgs84, or other crsName.
    @method convertObjectCoordinates
    @param {featureLayer} object.
    @return {featureLayer} Returns provided object with converted coordinates
    @private
  */
  _convertObjectCoordinates(object, crsName = null) {
    let firstProjection = object.options.crs.code;
    let baseProjection = crsName ? crsName : 'EPSG:4326';
    if (firstProjection !== baseProjection) {
      const geojson = Ember.$.extend(true, {}, object.feature);
      let result = L.geoJSON(geojson).getLayers()[0];
      let coordinatesArray = [];
      result.feature.geometry.coordinates.forEach(arr => {
        var arr1 = [];
        arr.forEach(pair => {
          if (result.feature.geometry.type === 'MultiPolygon') {
            let arr2 = [];
            pair.forEach(cords => {
              let transdormedCords = proj4(firstProjection, baseProjection, cords);
              arr2.push(transdormedCords);
            });
            arr1.push(arr2);
          } else {         
            let cords = proj4(firstProjection, baseProjection, pair);
            arr1.push(cords);
          }
        });
        coordinatesArray.push(arr1);
      });
      result.feature.geometry.coordinates = coordinatesArray;
      return result;
    } else {
      return object;
    }
  },

  /**
    Get coordinates point.
    @method getCoordPoint
    @param {String} crsName crs name, in which to give coordinates
    @return {Promise} Returns promise
  */
  getCoordPoint(crsName) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const leafletMap = this.get('mapApi').getFromApi('leafletMap');
      Ember.$(leafletMap._container).css('cursor', 'crosshair');

      var getCoord = (e) => {
        Ember.$(leafletMap._container).css('cursor', '');
        let crs = Ember.get(leafletMap, 'options.crs');
        if (!Ember.isNone(crsName)) {
          crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
        }

        resolve(crs.project(e.latlng));
      };

      leafletMap.once('click', getCoord);
    });
  }
});
