import Ember from 'ember';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
import booleanContains from 'npm:@turf/boolean-contains';
import area from 'npm:@turf/area';
import intersect from 'npm:@turf/intersect';
import rhumbBearing from 'npm:@turf/rhumb-bearing';
import rhumbDistance from 'npm:@turf/rhumb-distance';
import { getLeafletCrs } from '../utils/leaflet-crs';
import VectorLayer from '../layers/-private/vector';
import WfsLayer from '../layers/wfs';
import OdataLayer from '../layers/odata-vector';
import html2canvasClone from '../utils/html2canvas-clone';
import state from '../utils/state';
import ClipperLib from 'npm:clipper-lib';
import jsts from 'npm:jsts';

export default Ember.Mixin.create({
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

  /*
    Shows layers specified by IDs.

    @method showLayers.
    @param {Array} layerIds Array of layer IDs.
    @return nothing
  */
  showLayers(layerIds) {
    this._setVisibility(layerIds, true);
  },

  /**
    Hides layers specified by IDs.

    @method hideLayers.
    @param {Array} layerIds Array of layer IDs.
    @return nothing
  */
  hideLayers(layerIds) {
    this._setVisibility(layerIds);
  },

  /**
    Shows objects for layer.

    @method showLayerObjects
    @param {string} layerId Layer id.
    @param {string[]} objectIds Array of objects IDs.
    @return nothing
  */
  showLayerObjects(layerId, objectIds) {
    this._setVisibilityObjects(layerId, objectIds, true);
  },

  /**
    Hides objects for layer.

    @method hideLayerObjects
    @param {string} layerId Layer id.
    @param {Array} objectIds Array of objects IDs.
    @return nothing
  */
  hideLayerObjects(layerId, objectIds) {
    this._setVisibilityObjects(layerId, objectIds, false);
  },

  /**
    Show all layer objects.

    @method showAllLayerObjects
    @param {string} layerId Layer id.
    @return nothing
  */
  showAllLayerObjects(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    if (Ember.isNone(layer)) {
      throw `Layer '${layerId}' not found.`;
    }

    if (this._getTypeLayer(layer) instanceof VectorLayer) {
      const leafletObject = Ember.get(layer, '_leafletObject');
      let map = this.get('mapApi').getFromApi('leafletMap');

      let showExisting = leafletObject.options.showExisting;
      let continueLoading = leafletObject.options.continueLoading;
      if (!showExisting && !continueLoading) {
        if (!Ember.isNone(leafletObject)) {
          leafletObject.eachLayer((layerShape) => {
            if (map.hasLayer(layerShape)) {
              map.removeLayer(layerShape);
            }
          });
          leafletObject.clearLayers();
        }

        leafletObject.promiseLoadLayer = new Ember.RSVP.Promise((resolve) => {
          this._getModelLayerFeature(layerId, null, true).then(() => {
            resolve();
          });
        });
      } else {
        leafletObject.showLayerObjects = true;
        leafletObject.statusLoadLayer = true;
        map.fire('moveend');

        if (Ember.isNone(leafletObject.promiseLoadLayer) || !(leafletObject.promiseLoadLayer instanceof Ember.RSVP.Promise)) {
          leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
        }
      }

      leafletObject.promiseLoadLayer.then(() => {
        leafletObject.statusLoadLayer = false;
        leafletObject.promiseLoadLayer = null;
        leafletObject.eachLayer(function (layerShape) {
          if (!map.hasLayer(layerShape)) {
            map.addLayer(layerShape);
          }
        });
        let labelLayer = leafletObject._labelsLayer;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(labelLayer) && !map.hasLayer(labelLayer)) {
          map.addLayer(labelLayer);
        }
      });
    }
  },

  /**
    Hide all layer objects.

    @method hideAllLayerObjects
    @param {string} layerId Layer id.
    @return nothing
  */
  hideAllLayerObjects(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    if (Ember.isNone(layer)) {
      throw `Layer '${layerId}' not found.`;
    }

    if (this._getTypeLayer(layer) instanceof VectorLayer) {
      const leafletObject = Ember.get(layer, '_leafletObject');
      var map = this.get('mapApi').getFromApi('leafletMap');
      leafletObject.showLayerObjects = false;

      leafletObject.eachLayer(function (layerShape) {
        if (map.hasLayer(layerShape)) {
          map.removeLayer(layerShape);
        }
      });
      let labelLayer = leafletObject._labelsLayer;
      if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(labelLayer) && map.hasLayer(labelLayer)) {
        map.removeLayer(labelLayer);
      }
    }
  },

  /**
    Creates new layer with specified options.
    @method createNewLayer.
    @param {Object} options
    @return Layer ID.
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
    Remove object from layer.
    @method deleteLayerObject.
    @param {String} layerId Layer ID.
    @param {String} featureId Object ID.
    @return Promise.
  */
  deleteLayerObject(layerId, featureId) {
    this.deleteLayerObjects(layerId, [featureId]);
  },

  /**
    Remove shapes from layer.
    @method deleteLayerObjects.
    @param {string} layerId Layer ID.
    @param {Object[]} featureIds Array of objects IDs.
    @return Promise.
  */
  deleteLayerObjects(layerId, featureIds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let ids = [];
      this._getModelLayerFeature(layerId, featureIds, true).then(([layer, leafletObject]) => {
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
        resolve();
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Gets intersected features.
    @method getIntersectionObjects
    @param {Object} feature GeoJson Feature.
    @param {string} crsName Name of coordinate reference system, in which to give coordinates.
    @param {Array} layerIds Array of layers IDs.
    @return {Promise} Array of layers and objects which intersected selected object.
  */
  getIntersectionObjects(feature, crsName, layerIds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!Ember.isNone(feature) && feature.hasOwnProperty('geometry')) {
        const leafletMap = this.get('mapApi').getFromApi('leafletMap');
        let layersIntersect = [];
        layerIds.forEach(id => {
          const layer = this.get('mapLayer').findBy('id', id);
          if (!Ember.isNone(layer)) {
            let layerType = this._getTypeLayer(layer);
            if (layerType instanceof VectorLayer) {
              layersIntersect.push(layer);
            }
          }
        });

        let crs = crsName || 'EPSG:4326';
        let featureCrs = crs === 'EPSG:4326' ? feature : this._convertObjectCoordinates(crs, feature);
        let featureLayer = L.GeoJSON.geometryToLayer(featureCrs);
        let latlng = featureLayer instanceof L.Marker || featureLayer instanceof L.CircleMarker ?
          featureLayer.getLatLng() : featureLayer.getBounds().getCenter();
        let e = {
          latlng: latlng,
          polygonLayer: featureLayer,
          bufferedMainPolygonLayer: featureLayer,
          excludedLayers: [],
          layers: layersIntersect,
          results: Ember.A()
        };

        if (e.layers.length > 0) {
          leafletMap.fire('flexberry-map:identify', e);
        }

        e.results = Ember.isArray(e.results) ? e.results : Ember.A();
        let promises = Ember.A();

        // Handle each result.
        // Detach promises from already received features.
        e.results.forEach((result) => {
          if (Ember.isNone(result)) {
            return;
          }

          promises.pushObject(Ember.get(result, 'features'));
        });

        // Wait for all promises to be settled & call '_finishIdentification' hook.
        Ember.RSVP.allSettled(promises).then(() => {
          resolve(e.results);
        });
      }
    });
  },

  /**
    Get the nearest object
    @method getNearObject
    @param {string} layerId Layer ID of the selected object.
    @param {string} layerObjectId Object ID of the selected object.
    @param {Array} layerIdsArray Array of layers IDs in which to search.
    @return {Promise} Object constains distance, layer and layer object.
  */
  getNearObject(layerId, layerObjectId, layerIdsArray) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getModelLayerFeature(layerId, [layerObjectId]).then(([, leafletObject, layerObject]) => {
        let result = null;
        let promises = layerIdsArray.map(lid => {
          return new Ember.RSVP.Promise((resolve, reject) => {
            let layerModel = this.getLayerModel(lid);
            let layerType = this._getTypeLayer(layerModel);
            if (layerType instanceof OdataLayer) {
              let table = null;
              Ember.$.ajax({
                url: 'assets/flexberry/models/' + layerModel.get('_leafletObject.modelName') + '.json',
                async: false,
                success: function (data) {
                  table = data.className;
                }
              });
              let center = this.getObjectCenter(layerObject[0]);
              let geom = `SRID=4326;POINT(${center.lng} ${center.lat})`;
              geom = geom.replace('.', ',').replace('.', ',');
              let config = Ember.getOwner(this).resolveRegistration('config:environment');
              let _this = this;
              Ember.$.ajax({
                url: `${config.APP.backendUrls.getNearDistance}(geom='${geom}', table='${table}')`,
                type: 'GET',
                success: function (data) {
                  _this._getModelLayerFeature(lid, [data.pk]).then(([, leafletObject, layerObject]) => {
                    resolve({
                      distance: data.distance,
                      layer: layerModel,
                      object: layerObject[0],
                    });
                  });
                }
              });
            } else {
              this._getModelLayerFeature(lid, null).then(([layer, lObject, featuresLayer]) => {
                featuresLayer.forEach(obj => {
                  const id = this._getLayerFeatureId(layer, obj);
                  const distance = this._getDistanceBetweenObjects(layerObject[0], obj);

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

                resolve(result);
              });
            }
          });
        });

        Ember.RSVP.allSettled(promises).then((results) => {
          let res = null;
          results.forEach((item) => {
            if (Ember.isNone(res) || item.value.distance < res.distance) {
              res = item.value;
            }
          });
          resolve(res);
        });
      }).catch((e) => {
        reject(e);
      });
    });
  },

  getObjectCenter(object) {
    const type = Ember.get(object, 'feature.geometry.type');
    if (type === 'Point') {
      return object._latlng;
    } else {
      return object.getBounds().getCenter();
    }
  },

  /**
    Get distance between objects
    @method _getDistanceBetweenObjects
    @param {Object} firstLayerObject First layer object.
    @param {Object} secondLayerObject Second layer object.
    @return {number} Distance between objects in meters.
  */
  _getDistanceBetweenObjects(firstLayerObject, secondLayerObject) {
    const firstPoint = this.getObjectCenter(firstLayerObject);
    const firstObject = helpers.point([firstPoint.lat, firstPoint.lng]);

    const secondPoint = this.getObjectCenter(secondLayerObject);
    const secondObject = helpers.point([secondPoint.lat, secondPoint.lng]);

    // Get distance in meters.
    return distance.default(firstObject, secondObject, { units: 'kilometers' }) * 1000;
  },

  /**
    Get distance between objects
    @method getDistanceBetweenObjects
    @param {string} firstLayerId First layer id.
    @param {string} firstLayerObjectId First layer object id.
    @param {string} secondLayerId Second layer id.
    @param {string} secondLayerObjectId Second layer object id.
    @return {Promise} Distance between objects in meters.
  */
  getDistanceBetweenObjects(firstLayerId, firstLayerObjectId, secondLayerId, secondLayerObjectId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.all([
        this._getModelLayerFeature(firstLayerId, [firstLayerObjectId]),
        this._getModelLayerFeature(secondLayerId, [secondLayerObjectId])
      ]).then((result) => {
        let objA = result[0][2][0];
        let objB = result[1][2][0];
        resolve(this._getDistanceBetweenObjects(objA, objB));
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Get layer object attributes and coordinates.
    @method getLayerObjectOptions
    @param {String} layerId Layer ID.
    @param {String} featureId Object ID.
    @param {String} crsName Name of coordinate reference system, in which to give coordinates.
    @return {Promise} Attributes and coordinates
  */
  getLayerObjectOptions(layerId, featureId, crsName) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let result;
      this._getModelLayerFeature(layerId, [featureId]).then(([, leafletLayer, featureLayer]) => {
        if (leafletLayer && featureLayer) {
          result = Object.assign({}, featureLayer[0].feature.properties);
          result.geometry = featureLayer[0].feature.geometry.coordinates;
          if (crsName) {
            let NewObjCrs = this._convertObjectCoordinates(leafletLayer.options.crs.code, featureLayer[0].feature, crsName);
            result.geometry = NewObjCrs.geometry.coordinates;
          }

          let obj = leafletLayer.options.crs.code === 'EPSG:4326' ?
            featureLayer[0].feature : this._convertObjectCoordinates(leafletLayer.options.crs.code, featureLayer[0].feature);
          result.area = area(obj);
          resolve(result);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Check if object A contains object B.
    @method isContainsObject
    @param {String} layerAId First layer ID.
    @param {String} objectAId First object ID.
    @param {String} layerBId Second layer ID.
    @param {String} objectBId Second object ID.
    @return {Promise} true or false.
  */
  isContainsObject(layerAId, objectAId, layerBId, objectBId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.all([
        this._getModelLayerFeature(layerAId, [objectAId]),
        this._getModelLayerFeature(layerBId, [objectBId])
      ]).then((result) => {
        let objA = result[0][2][0].feature;
        let objB = result[1][2][0].feature;
        let leafletLayerA = result[0][1];
        let leafletLayerB = result[1][1];
        if (objA && objB && leafletLayerA && leafletLayerB) {
          let feature1 = leafletLayerA.options.crs.code === 'EPSG:4326' ? objA : this._convertObjectCoordinates(leafletLayerA.options.crs.code, objA);
          let feature2 = leafletLayerB.options.crs.code === 'EPSG:4326' ? objB : this._convertObjectCoordinates(leafletLayerB.options.crs.code, objB);

          if (feature1.geometry.type === 'MultiPolygon') {
            feature1 = L.polygon(feature1.geometry.coordinates[0]).toGeoJSON();
          }

          if (feature2.geometry.type === 'MultiPolygon') {
            feature2 = L.polygon(feature2.geometry.coordinates[0]).toGeoJSON();
          }

          resolve(booleanContains(feature1, feature2));
        }

      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Calculate the area of ​​object B that extends beyond the boundaries of object A.
    @method getAreaExtends
    @param {String} layerAId First layer ID.
    @param {String} objectAId First object ID.
    @param {String} layerBId Second layer ID.
    @param {String} objectBId Second object ID.
    @return {Promise} Area
  */
  getAreaExtends(layerAId, objectAId, layerBId, objectBId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.all([
        this._getModelLayerFeature(layerAId, [objectAId]),
        this._getModelLayerFeature(layerBId, [objectBId])
      ]).then((result) => {
        let objA = result[0][2][0].feature;
        let objB = result[1][2][0].feature;
        let layerObjectA = result[0][1];
        let layerObjectB = result[1][1];
        let feature1 = layerObjectA.options.crs.code === 'EPSG:4326' ? objA : this._convertObjectCoordinates(layerObjectA.options.crs.code, objA);
        let feature2 = layerObjectB.options.crs.code === 'EPSG:4326' ? objB : this._convertObjectCoordinates(layerObjectB.options.crs.code, objB);
        let intersectionRes = intersect.default(feature2, feature1);
        if (intersectionRes) {
          let resultArea = area(feature2) - area(intersectionRes);
          resolve(resultArea);
        } else {
          resolve(area(feature2));
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Get layer type.
    @method _getTypeLayer
    @param {Object} layerModel layer model.
    @return {Object} layer type
  */
  _getTypeLayer(layerModel) {
    let className = Ember.get(layerModel, 'type');
    let layerType = Ember.getOwner(this).knownForType('layer', className);
    return layerType;
  },

  _setVisibility(layerIds, visibility = false) {
    if (Ember.isArray(layerIds)) {
      const layers = this.get('mapLayer');
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');
      layerIds.forEach(id => {
        const layer = layers.findBy('id', id);
        if (layer) {
          layer.set('visibility', visibility);
          if (visibility && this._getTypeLayer(layer) instanceof VectorLayer) {
            let leafletObject = Ember.get(layer, '_leafletObject');
            let showExisting = leafletObject.options.showExisting;
            let continueLoading = leafletObject.options.continueLoading;
            if (!showExisting && !continueLoading) {
              this._getModelLayerFeature(id, null, true).then(() => {
                layer.set('visibility', visibility);
              });
            } else {
              leafletMap.fire('moveend');
            }
          }
        }
      });
    }
  },

  /**
    Get object id by object and layer.

    @method _getLayerFeatureId
    @param {Object} layer Layer.
    @param {Object} layerObject Object.
    @return {number} Object ID.
  */
  _getLayerFeatureId(layer, layerObject) {
    let field = this._getPkField(layer);
    if (layerObject.state !== state.insert) {
      if (layerObject.feature.properties.hasOwnProperty(field)) {
        return Ember.get(layerObject, 'feature.properties.' + field);
      }

      return Ember.get(layerObject, 'feature.id');
    } else {
      return null;
    }
  },

  /**
    Determine the visibility of the specified objects by id for the layer.

    @method _setVisibilityObjects
    @param {string} layerId Layer ID.
    @param {string[]} objectIds Array of objects IDs.
    @param {boolean} [visibility=false] visibility Object Visibility.
  */
  _setVisibilityObjects(layerId, objectIds, visibility = false) {
    if (Ember.isArray(objectIds)) {
      const layers = this.get('mapLayer');
      const layer = layers.findBy('id', layerId);
      if (Ember.isNone(layer)) {
        throw `Layer '${layerId}' not found.`;
      }

      if (this._getTypeLayer(layer) instanceof VectorLayer) {
        const leafletObject = Ember.get(layer, '_leafletObject');

        if (Ember.isNone(leafletObject)) {
          throw 'Layer type not supported';
        }

        const map = this.get('mapApi').getFromApi('leafletMap');
        if (visibility) {
          let showExisting = leafletObject.options.showExisting;
          let continueLoading = leafletObject.options.continueLoading;
          if (!showExisting && !continueLoading) {
            leafletObject.promiseLoadLayer = new Ember.RSVP.Promise((resolve) => {
              this._getModelLayerFeature(layerId, objectIds, true).then(() => {
                resolve();
              });
            });
          } else {
            leafletObject.showLayerObjects = visibility;
            leafletObject.statusLoadLayer = true;
            map.fire('moveend');
            if (Ember.isNone(leafletObject.promiseLoadLayer) || !(leafletObject.promiseLoadLayer instanceof Ember.RSVP.Promise)) {
              leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
            }
          }
        } else {
          leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
        }

        leafletObject.promiseLoadLayer.then(() => {
          leafletObject.statusLoadLayer = false;
          leafletObject.promiseLoadLayer = null;
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
          let labelLayer = leafletObject._labelsLayer;
          if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(labelLayer) && !map.hasLayer(labelLayer)) {
            objectIds.forEach(objectId => {
              let objects = Object.values(labelLayer._layers).filter(shape => {
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
        });
      }
    }
  },

  /**
    To copy Object from Source layer to Destination.
    @method copyObject
    @param {Object} source Object with source settings
    {
      layerId, //{string} Layer ID
      objectId, //{string} Object ID
      shouldRemove //{Bool} Should remove object from source layer
    }
    @param {Object} destination Object with destination settings
    {
      layerId, //{string} Layer ID
      properties //{Object} Properties of new object.
    }
    @return {Promise} Object in Destination layer
  */
  copyObject(source, destination) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getModelLayerFeature(source.layerId, [source.objectId], source.shouldRemove).then(([, sourceLeafletLayer, obj]) => {
        let sourceFeature = obj[0];
        let [destLayerModel, destLeafletLayer] = this._getModelLeafletObject(destination.layerId);
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
            reject(`Unknown layer type: '${destLayerModel.get('settingsAsObject.typeGeometry')}`);
        }

        if (!Ember.isNone(destFeature)) {
          destFeature.feature = {
            properties: Object.assign({}, sourceFeature.feature.properties, destination.properties || {})
          };

          destLeafletLayer.addLayer(destFeature);

          if (source.shouldRemove) {
            sourceLeafletLayer.removeLayer(sourceFeature);
          }

          resolve(destFeature);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Calculate the area of intersection between object A and objects in array B.
    @method getIntersectionArea
    @param {String} layerAId First layer ID.
    @param {String} objectAId First object ID.
    @param {String} layerBId Second layer ID.
    @param {Array} objectBIds Array of object IDs in second layer.
    @param {Bool} showOnMap flag indicates if intersection area will be displayed on map.
    @return {Promise} If showOnMap = true, return objects, which show on map in serviceLayer, and area, else only area.
  */
  getIntersectionArea(layerAId, objectAId, layerBId, objectBIds, showOnMap) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let result = Ember.A();
      Ember.RSVP.all([
        this._getModelLayerFeature(layerAId, [objectAId]),
        this._getModelLayerFeature(layerBId, objectBIds)
      ]).then((res) => {
        let layerObjectA = res[0][1];
        let layerObjectB = res[1][1];
        let objA = res[0][2][0].feature;
        let feature1 = layerObjectA.options.crs.code === 'EPSG:4326' ? objA : this._convertObjectCoordinates(layerObjectA.options.crs.code, objA);
        let featuresB = res[1][2];
        featuresB.forEach((feat) => {
          let objB = feat.feature;
          let feature2 = layerObjectB.options.crs.code === 'EPSG:4326' ? objB : this._convertObjectCoordinates(layerObjectB.options.crs.code, objB);
          let intersectionRes = intersect.default(feature1, feature2);
          if (intersectionRes) {
            let object = {
              id: objB.properties.primarykey,
              area: area(intersectionRes)
            };
            if (showOnMap) {
              let obj = L.geoJSON(intersectionRes, {
                style: { color: 'green' }
              });
              let serviceLayer = this.get('mapApi').getFromApi('serviceLayer');
              obj.addTo(serviceLayer);
              object.objectIntesect = obj;
            }

            result.pushObject(object);
          } else {
            result.pushObject({
              id: objB.properties.primarykey,
              area: 'Intersection not found'
            });
          }
        });
        if (!Ember.isNone(result)) {
          resolve(result);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Cleans the service layer.
    @method clearServiceLayer
    @return nothing
  */
  clearServiceLayer() {
    let serviceLayer = this.get('mapApi').getFromApi('serviceLayer');
    serviceLayer.clearLayers();
  },

  /**
    Create image for layer object.
    @method  getSnapShot
    @param {Object} source Object with settings
    {
      layerId, //{string} Layer ID.
      objectId, //{string} Object ID.
      layerArrIds, //{Array} Array of layers IDs.
      options {
        width, //{number} width image
        height //{number} height image
      }
    }
    @return {Promise} Image url.
  */
  getSnapShot({ layerId, objectId, layerArrIds, options }) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getModelLayerFeature(layerId, [objectId]).then(([layerModel, leafletObject, featureLayer]) => {
        let allLayers = this.get('mapLayer.canonicalState');
        let allLayersIds = allLayers.map((l) => l.id);
        if (layerArrIds) {
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

        let load = [];
        let ids = Ember.isEmpty(layerArrIds) ? allLayersIds : layerArrIds;
        if (ids) {
          ids.forEach((lid) => {
            if (lid !== layerId) {
              let [layer, layerObject] = this._getModelLeafletObject(lid);
              let layerType = this._getTypeLayer(layer);
              if ((layerType instanceof WfsLayer || layerType instanceof OdataLayer) && !Ember.isNone(layerObject)) {
                layerObject.statusLoadLayer = true;
                load.push(layerObject);
              }
            }
          });
        }

        let layerType = this._getTypeLayer(layerModel);
        if (layerType instanceof WfsLayer || layerType instanceof OdataLayer) {
          leafletObject.statusLoadLayer = true;
          load.push(leafletObject);
        }

        leafletMap.once('moveend', () => {
          Ember.run.later(() => {
            document.getElementsByClassName('leaflet-control-zoom leaflet-bar leaflet-control')[0].style.display = 'none';
            document.getElementsByClassName('history-control leaflet-bar leaflet-control horizontal')[0].style.display = 'none';
            Ember.$(document).find('.leaflet-top.leaflet-left').css('display', 'none');
            Ember.$(document).find('.leaflet-top.leaflet-right').css('display', 'none');
            Ember.$(document).find('.leaflet-bottom.leaflet-right').css('display', 'none');

            let promises = load.map((object) => {
              return object.promiseLoadLayer;
            });

            Ember.RSVP.allSettled(promises).then((e) => {
              load.forEach((obj) => {
                obj.statusLoadLayer = false;
                obj.promiseLoadLayer = null;
              });

              let html2canvasOptions = Object.assign({
                useCORS: true,
                onclone: function (clonedDoc) {
                  html2canvasClone(clonedDoc);
                }
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
                  Ember.$(document).find('.leaflet-top.leaflet-left').css('display', 'block');
                  Ember.$(document).find('.leaflet-top.leaflet-right').css('display', 'block');
                  Ember.$(document).find('.leaflet-bottom.leaflet-right').css('display', 'block');
                  $mapPicture.height(heightMap);
                  $mapPicture.width(widthMap);
                });
            });
          });
        });

        let bounds = featureLayer[0].getBounds();
        if (!Ember.isNone(bounds)) {
          leafletMap.fitBounds(bounds.pad(0.5));
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Download image for layer object.
    @method  downloadSnapShot
    @param {Object} source Object with settings
    {
      layerId, //{string} Layer ID.
      objectId, //{string} Object ID.
      layerArrIds, //{Array} Array of layers IDs.
      options {
        width, //{number} width image
        height //{number} height image
      },
      fileName //{string} File name.
    }
    @return {File} Image file.
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
    Get the object rhumb.
    @method  getRhumb
    @param {string} layerId Layer ID.
    @param {string} objectId Object ID.
    @return {Promise} Object rhumb.
  */
  getRhumb(layerId, objectId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getModelLayerFeature(layerId, [objectId]).then(([, leafletObject, featureLayer]) => {
        let cors = featureLayer[0]._latlngs;
        let result = [];

        var rowPush = function (vertexNum1, vertexNum2, point1, point2) {
          const pointFrom = helpers.point([point2.lng, point2.lat]);
          const pointTo = helpers.point([point1.lng, point1.lat]);

          // We get the distance and translate into meters.
          const distance = rhumbDistance.default(pointFrom, pointTo, { units: 'kilometers' }) * 1000;

          // Get the angle.
          const bearing = rhumbBearing.default(pointTo, pointFrom);

          let rhumb;
          let angle;

          // Calculates rhumb.
          if (bearing <= 90 && bearing >= 0) {
            // СВ
            rhumb = 'СВ';
            angle = bearing;
          } else if (bearing <= 180 && bearing >= 90) {
            // ЮВ
            rhumb = 'ЮВ';
            angle = (180 - bearing);
          } else if (bearing >= -180 && bearing <= -90) {
            // ЮЗ
            rhumb = 'ЮЗ';
            angle = (180 + bearing);
          } if (bearing <= 0 && bearing >= -90) {
            // СЗ
            rhumb = 'СЗ';
            angle = (-1 * bearing);
          }

          return {
            rhumb: rhumb,
            angle: angle,
            distance: distance
          };
        };

        let startPoint = null;
        let type;
        for (let i = 0; i < cors.length; i++) {
          for (let j = 0; j < cors[i].length; j++) {
            let n;
            let point1;
            let point2;
            let item = cors[i][j];

            // Polygon.
            if (!Ember.isNone(item.length)) {
              type = 'Polygon';
              for (let k = 0; k < item.length; k++) {
                startPoint = k === 0 ? item[k] : startPoint;
                point1 = item[k];
                n = !Ember.isNone(item[k + 1]) ? k + 1 : 0;
                point2 = item[n];

                result.push(rowPush(k, n, point1, point2));
              }

              // LineString.
            } else {
              type = 'LineString';
              startPoint = j === 0 ? item : startPoint;
              point1 = item;
              n = !Ember.isNone(cors[i][j + 1]) ? j + 1 : 0;
              point2 = cors[i][n];

              result.push(rowPush(j, n, point1, point2));
            }
          }
        }

        resolve({
          type: type,
          startPoint: startPoint,
          crs: 'EPSG:4326',
          skip: 1,
          rhumbCoordinates: result,
          coordinates: cors
        });
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Add a layer to the group.

    @method layerToGroup
    @parm {string} layerId Layer ID.
    @parm {string} layerGroupId Group layer ID.
    @return nothing
  */
  moveLayerToGroup(layerId, layerGroupId) {
    const layer = this.get('mapLayer').findBy('id', layerGroupId);
    if (Ember.isNone(layer)) {
      throw (`Group layer '${layerGroupId}' not found`);
    }

    let layerModel = this.getLayerModel(layerId);
    if (Ember.isNone(layerModel)) {
      throw (`Layer '${layerId}' not found`);
    }

    layerModel.set('parent', layer);
  },

  /**
    Edit object layer.
    @method editLayerObject
    @param {String} layerId Layer ID.
    @param {String} objectId Object ID.
    @param {String} polygon Сoordinates of the new object in geoJSON format.
    @param {String} crsName Name of coordinate reference system.
    @return {Promise} Layer object.
  */
  editLayerObject(layerId, objectId, polygon, crsName) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (polygon) {
        this._getModelLayerFeature(layerId, [objectId], true).then(([, leafletLayer, featureLayer]) => {
          if (leafletLayer && featureLayer) {
            let crs = leafletLayer.options.crs;
            if (!Ember.isNone(crsName)) {
              crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
            }

            let coordsToLatLng = function (coords) {
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
                featureLayer[0].setLatLngs(geoJSON._latlngs);
              } else {
                featureLayer[0].setLatLng(geoJSON._latlng);
              }

              if (typeof leafletLayer.editLayer === 'function') {
                leafletLayer.editLayer(featureLayer[0]);
                resolve(featureLayer[0]);
              }
            } else {
              reject(`Unable to convert coordinates for this CRS '${crsName}'`);
            }
          } else if (leafletLayer) {
            reject(`Layer '${layerId}' not found`);
          } else if (featureLayer[0]) {
            reject(`Object '${objectId}' not found`);
          }
        }).catch((e) => {
          reject(e);
        });
      } else {
        reject('new object settings not passed');
      }
    });
  },

  /**
    Upload file.
    @method uploadFile
    @param {File} file.
    @return {Promise} Object in geoJSON format
  */
  uploadFile(file) {
    let config = Ember.getOwner(this).resolveRegistration('config:environment');

    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: `${config.APP.backendUrl}/controls/FileUploaderHandler.ashx?FileName=${file.name}`,
        type: 'POST',
        data: file,
        cache: false,
        processData: false,
        success: function (data) {
          resolve(data);
        },
        error: function (e) {
          reject(e);
        }
      });
    });
  },

  _isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  },

  /**
    Convert coordinates of object to wgs84, or other crsName.
    @method convertObjectCoordinates
    @param {featureLayer} object.
    @return {featureLayer} Returns provided object with converted coordinates
    @private
  */
  _convertObjectCoordinates(projection, object, crsName = null) {

    // copy from https://stackoverflow.com/a/48218209/2014079 for replace $.extend
    // such as it is not properly work with Proxy properties
    var mergeDeep = function (...objects) {
      const isObject = obj => obj && typeof obj === 'object';

      return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
          const pVal = prev[key];
          const oVal = obj[key];

          if (Array.isArray(pVal) && Array.isArray(oVal)) {
            prev[key] = pVal.concat(...oVal);
          } else if (isObject(pVal) && isObject(oVal)) {
            prev[key] = mergeDeep(pVal, oVal);
          } else {
            prev[key] = oVal;
          }
        });

        return prev;
      }, {});
    };

    let knownCrs = Ember.getOwner(this).knownForType('coordinate-reference-system');
    let knownCrsArray = Ember.A(Object.values(knownCrs));
    let firstProjection = projection ? projection : 'EPSG:4326';
    let secondProjection = crsName ? crsName : 'EPSG:4326';
    let firstCrs = knownCrsArray.findBy('code', firstProjection);
    let secondCrs = knownCrsArray.findBy('code', secondProjection);
    if (firstCrs && secondCrs) {
      let firstDefinition = Ember.get(firstCrs, 'definition');
      let secondDefinition = Ember.get(secondCrs, 'definition');
      if (firstDefinition && secondDefinition) {
        if (firstDefinition !== secondDefinition) {
          let result = mergeDeep({}, object);
          let coordinatesArray = [];
          if (result.geometry.type !== 'Point') {
            result.geometry.coordinates.forEach(arr => {
              var arr1 = [];
              arr.forEach(pair => {
                if (result.geometry.type === 'MultiPolygon') {
                  let arr2 = [];
                  pair.forEach(cords => {
                    let transdormedCords = proj4(firstDefinition, secondDefinition, cords);
                    arr2.push(transdormedCords);
                  });
                  arr1.push(arr2);
                } else {
                  let cords = proj4(firstDefinition, secondDefinition, pair);
                  arr1.push(cords);
                }
              });
              coordinatesArray.push(arr1);
            });
          } else {
            coordinatesArray = proj4(firstDefinition, secondDefinition, result.geometry.coordinates);
          }

          result.geometry.coordinates = coordinatesArray;
          return result;
        } else {
          return object;
        }
      }
    } else {
      throw 'unknown coordinate reference system';
    }
  },

  /*
    Get the field to search for objects
    @method getPkField
    @param {Object} layer.
    @return {String} Field name.
  */
  _getPkField(layer) {
    let layerType = this._getTypeLayer(layer);
    if (layerType instanceof VectorLayer) {
      const getPkField = this.get('mapApi').getFromApi('getPkField');
      if (typeof getPkField === 'function') {
        return getPkField(layer);
      }

      let field = Ember.get(layer, 'settingsAsObject.pkField');
      return Ember.isNone(field) ? 'primarykey' : field;
    } else {
      throw 'Layer is not VectorLayer';
    }
  },

  /**
    Get coordinates point.
    @method getCoordPoint
    @param {String} crsName Name of coordinate reference system, in which to give coordinates.
    @return {Promise} Coordinate.
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
  },

  /**
    Get count of features.
    @method _getCount
    @param {String} layerId layer ID.
    @return {Promise} count of features.
  */
  _getCount(layerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('mapApi').getFromApi('leafletMap');
      let e = {
        layer: layerId,
        results: Ember.A()
      };

      leafletMap.fire('flexberry-map:getCountFeatures', e);
      if (Ember.isNone(e.results)) {
        reject(`Layer '${layerId}' not found`);
        return;
      }

      if (e.results[0] instanceof Ember.RSVP.Promise) {
        e.results[0].then((res) => {
          resolve(res);
        });
      }
    });
  },

  /**
    Get promises load features.
    @method _getPromisesLoadFeatures
    @param {String} layerId Layer ID.
    @return {Promise} array promises.
  */
  _getPromisesLoadFeatures(layerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let layerModel = this.getLayerModel(layerId);
      let layerType = this._getTypeLayer(layerModel);
      let promises = Ember.A();
      if (layerType instanceof OdataLayer) {
        this._getCount(layerId).then((res) => {
          let count = res;
          let maxFeatures = 10000;
          let skip = 0;
          do {
            promises.push(this._getModelLayerFeature(layerId, null, false, 'id', maxFeatures, skip));
            count -= maxFeatures;
            skip += maxFeatures;
          } while (count - maxFeatures >= 0);

          resolve(promises);
        }).catch((e) => {
          reject(e);
        });
      } else {
        promises.push(this._getModelLayerFeature(layerId, null));
        resolve(promises);
      }
    });
  },

  /**
    Add to array points and feature.
    @method _addToArrayPointsAndFeature
    @param {String} layerId Layer ID.
    @param {String} crsName Name of coordinate reference system, in which to conver coordinates.
    @return {Promise} array of points and feature.
  */
  _addToArrayPointsAndFeature(layerId, crsName) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getPromisesLoadFeatures(layerId).then((loadArr) =>{
        Ember.RSVP.all(loadArr).then((res) => {
          if (!Ember.isEmpty(res)) {
            let layerObject = res[0][1];
            let arrPoints = Ember.A();
            let features = Ember.A();
            res.forEach((objs) => {
              if (!Ember.isEmpty(objs[2])) {
                objs[2].forEach((layer) =>{
                  let obj = layer.feature;
                  //let feature = layerObject.options.crs.code === 'EPSG:4326' ? obj : this._convertObjectCoordinates(layerObject.options.crs.code, obj);
                  let featureLayer = L.GeoJSON.geometryToLayer(obj);
                  arrPoints.push(this._coordsToPoints(featureLayer.getLatLngs()));
                  features.push(layer);
                });
              }
            });

            resolve({ arrPoints, features });
          } else {
            reject('Error to load objects');
          }
        });
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Difference layers.
    @method differenceLayers
    @param {String} layerAId First layer ID.
    @param {String} layerBId Second layer ID.
    @return {Promise} array of Object { diffFeatures, layerAFeatures, layerBFeatures }.
  */
  differenceLayers(layerAId, layerBId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let result = Ember.A();
      Ember.RSVP.all([
        this._addToArrayPointsAndFeature(layerAId),
        this._addToArrayPointsAndFeature(layerBId)
      ]).then((res) => {
        let subj = res[0].arrPoints;
        let clip = res[1].arrPoints;
        let solution = ClipperLib.Paths();
        let cpr = new ClipperLib.Clipper();
        for(let s = 0, slen = subj.length; s<slen; s++) {
          if (Ember.isArray(subj[s])) {
            for(let k = 0, klen = subj[s].length; k<klen; k++) {
              cpr.AddPaths(subj[s][k], ClipperLib.PolyType.ptSubject, true);
            }
          } else {
            cpr.AddPaths(subj[s], ClipperLib.PolyType.ptSubject, true);
          }
        }
        for(let c = 0, clen = clip.length; c < clen; c++) {
          if (Ember.isArray(clip[c])) {
            for(let k = 0, klen = clip[c].length; k<klen; k++) {
              cpr.AddPaths(clip[c][k], ClipperLib.PolyType.ptClip, true);
            }
          } else {
            cpr.AddPaths(clip[c], ClipperLib.PolyType.ptClip, true);
          }
        }
        cpr.Execute(ClipperLib.ClipType.ctDifference, solution);
        if (!Ember.isEmpty(solution)) {
          let jstsGeoJSONReader = new jsts.io.GeoJSONReader();
          let diffNotNullArea = solution.filter((geom)=>{
            return ClipperLib.Clipper.Area(geom) !== 0;
          }).map((geom) => {
            let feature = {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [this._pointsToCoords(geom)],
              }
            };
            let jstsFeature = jstsGeoJSONReader.read(feature);
            if (jstsFeature.geometry.isValid()) {
              let area = jstsFeature.geometry.getArea();
              return { feature, jstsGeometry: jstsFeature.geometry, area };
            } else {
              return { feature, jstsGeometry: jstsFeature.geometry, area: 0 };
            }
          }).filter((diff) => {
            return diff.area > 0;
          });

          resolve({ diffFeatures: diffNotNullArea, layerA: res[0].features, layerB: res[1].features });
        } else {
          resolve('The difference is not found');
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Compare layers.
    @method compareLayers
    @param {String} layerAId First layer ID.
    @param {String} layerBId Second layer ID.
    @param {String} condition Comparison conditions ["contains", "intersects", "notIntersects"].
    @param {Boolean} showOnMap flag indicates if difference area will be displayed on map.
    @return {Promise} array features.
  */
  compareLayers(layerAId, layerBId, condition, showOnMap) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let result = Ember.A();
      let cond = ['contains', 'intersects', 'notIntersects'];
      let diffLayerPromise = this.differenceLayers(layerAId, layerBId);
      if (!cond.includes(condition)) {
        reject('The comparison condition is set incorrectly. It must be ["contains", "intersects", "notIntersects"].');
      } else if (condition === cond[2]) {
          diffLayerPromise = this.differenceLayers(layerBId, layerAId);
      }
      diffLayerPromise.then((res) => {
        let jstsGeoJSONReader = new jsts.io.GeoJSONReader();
        res.diffFeatures.forEach((diff) => {
          if (!cond.includes(condition)) {
            reject('The comparison condition is set incorrectly. It must be ["contains", "intersects", "notIntersects"].');
          }

          let layerFeatures = res.layerB;
          let object = {
            areaDifference: diff.area
          };
          let i = 0;
          let count = layerFeatures.length;
          layerFeatures.every((feat) => {
            let jstsFeat = jstsGeoJSONReader.read(feat.feature);
            if (jstsFeat.geometry.isValid()) {
              if (condition === cond[0] && jstsFeat.geometry.contains(diff.jstsGeometry)) {
                object.id = jstsFeat.properties.primarykey;
                return false;
              } else if (condition === cond[1] && jstsFeat.geometry.intersects(diff.jstsGeometry) && !jstsFeat.geometry.contains(diff.jstsGeometry)) {
                object.id = jstsFeat.properties.primarykey;
                return false;
              } else if (condition === cond[2] && jstsFeat.geometry.intersects(diff.jstsGeometry)) {
                object.id = jstsFeat.properties.primarykey;
                return false;
              } else {
                return true;
              }
              /*switch(condition) {
                case cond[0]:
                  if (jstsFeat.geometry.contains(diff.jstsGeometry)) {
                    object.id = jstsFeat.properties.primarykey;
                    return false;
                  }

                  break;
                case cond[1]:
                  if (jstsFeat.geometry.intersects(diff.jstsGeometry) && !jstsFeat.geometry.contains(diff.jstsGeometry)) {
                    object.id = jstsFeat.properties.primarykey;
                    return false;
                  }

                  return true;
                  break;

                default:
                  return true;
              }*/
            }
          });

          if (showOnMap) {
            let serviceLayer = this.get('mapApi').getFromApi('serviceLayer');
            let crs = layerFeatures[0].options.crs;
            let coordsToLatLng = function(coords) {
              return crs.unproject(L.point(coords));
            };
            let featureLayer = L.geoJSON(diff.feature, { coordsToLatLng: coordsToLatLng.bind(this) }).getLayers()[0];
            object.objectDifference = featureLayer;
            featureLayer.addTo(serviceLayer);
          }

          result.pushObject(object);
        });
          resolve(result);
      }).catch((e) => {
        reject(e);
      });
    });
  },

  _pointAmplifier() {
		return Math.pow(10,8);
	},

  _coordsToPoints(polygons) {
    let amp = this._pointAmplifier();
    if (Array.isArray(polygons[0]) || (!(polygons instanceof L.LatLng) && (polygons[0] instanceof L.LatLng))) {
      let coords = [];
      for (let i = 0; i < polygons.length; i++) {
        coords.push(this._coordsToPoints(polygons[i]));
      }

      return coords;
    }

    return {X: Math.round(polygons.lng * amp), Y: Math.round(polygons.lat * amp)};
	},

  _pointsToCoords(points) {
    let amp = this._pointAmplifier();
    if (Array.isArray(points[0]) || (!(points instanceof ClipperLib.IntPoint) && (points[0] instanceof ClipperLib.IntPoint))) {
      let coord = [];
      for (let i = 0; i < points.length; i++) {
        coord.push(this._pointsToCoords(points[i]));
      }

      // closing polygon
      if (!Array.isArray(coord[0][0])) {
        let first = coord[0];
        coord.push(first);
      }

      return coord;
    }

    return [points.X / amp, points.Y / amp];
	}
});
