/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base-layer';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';
import jsts from 'npm:jsts';
import { checkMapZoom } from '../utils/check-zoom';
import featureWithAreaIntersect from '../utils/feature-with-area-intersect';

const { assert } = Ember;

/**
  Because z-index leaflet-tile-pane = 200.
  Do more just in case
*/
export const begIndex = 300;

/**
  BaseVectorLayer component for other flexberry-gis vector(geojson, kml, etc.) layers.

  @class BaseVectorLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({
  /**
    Property flag indicates than result layer will be showed as cluster layer.

    @property clusterize
    @type Boolean
    @default false
   */
  clusterize: false,

  /**
    Property contains options for <a href="http://leaflet.github.io/Leaflet.markercluster/#options">L.markerClusterGroup</a>.

    @property clusterOptions
    @type Object
    @default null
   */
  clusterOptions: null,

  /**
    Observes and handles changes in {{#crossLink "BaseVectorLayerComponent/clusterize:property"}}'clusterize' property{{/crossLink}}.
    Resets layer with respect to new value of {{#crossLink "BaseVectorLayerComponent/clusterize:property"}}'clusterize' property{{/crossLink}}.

    @method _clusterizeDidChange
    @private
  */
  _clusterizeDidChange: Ember.observer('clusterize', function () {
    // Call to Ember.run.once is needed because some of layer's 'dynamicProperties' can be unchenged yet ('clusterize' is dynamic property),
    // but Ember.run.once guarantee that all 'dynamicProperies' will be already chaged before '_resetLayer' will be called.
    Ember.run.once(this, '_resetLayer');
  }),

  /**
    @method _getContainer
    @return HTMLElement
    Returns the HTML element for this layer.
  */
  _getContainer: function () {
    let className = 'leaflet-' + this.get('_pane') + '-pane';
    let container = Ember.$(`.${className}`);
    return container[0];
  },

  /**
    @method _getContainerPane
    @return HTMLElement
    Returns the HTML element for this label layer.
  */
  _getContainerPane: function () {
    let className = 'leaflet-' + this.get('_paneLabel') + '-pane';
    let container = Ember.$(`.${className}`);
    return container[0];
  },

  /**
    @method _getContainerPaneLabelMulti
    @return HTMLElement
    Returns the HTML element for this label layer.
  */
  /*_getContainerPaneLabelMulti: function () {
    let className = 'leaflet-' + this.get('_paneLabelMulti') + '-pane';
    let container = Ember.$(`.${className}`);
    return container[0];
  },*/

  /**
    @property _pane
    @type String
    @readOnly
  */
  _pane: Ember.computed('layerModel.id', function () {
    // to switch combine-layer
    let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
    return 'vectorLayer' + this.get('layerModel.id') + layerId;
  }),

  /**
    @property _paneLabel
    @type String
    @readOnly
  */
  _paneLabel: Ember.computed('layerModel.id', 'labelSettings.signMapObjects', function () {
    if (this.get('labelSettings.signMapObjects')) {
      // to switch combine-layer
      let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
      return 'labelLayer' + this.get('layerModel.id') + layerId;
    }

    return null;
  }),

  /**
    @property _renderer
    @type Object
    @readOnly
  */
  _renderer: Ember.computed('_pane', function () {
    let pane = this.get('_pane');
    return L.canvas({ pane: pane });
  }),

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerZIndex: function () {
    let thisPane = this.get('_pane');
    let leafletMap = this.get('leafletMap');
    if (thisPane && !Ember.isNone(leafletMap)) {
      let pane = leafletMap.getPane(thisPane);
      if (pane) {
        pane.style.zIndex = this.get('index') + begIndex;
      }
    }

    let thisPaneLabel = this.get('_paneLabel');
    if (thisPaneLabel && !Ember.isNone(leafletMap)) {
      let pane = leafletMap.getPane(thisPaneLabel);
      if (pane) {
        pane.style.zIndex = (Ember.isNone(this.get('labelSettings.index')) ? this.get('index') : this.get('labelSettings.index')) + begIndex + 1; //to make the label layer higher than the vector layer
      }
    }

    let additionalZoomLabel = this.get('additionalZoomLabel');
    if (additionalZoomLabel) {
      additionalZoomLabel.forEach(additionalZoom => {
        let _paneLabel = additionalZoom._paneLabel;
        if (_paneLabel && !Ember.isNone(leafletMap)) {
          let pane = leafletMap.getPane(_paneLabel);
          if (pane) {
            pane.style.zIndex = (Ember.isNone(this.get('labelSettings.index')) ? this.get('index') : this.get('labelSettings.index')) + begIndex + 1; //to make the label layer higher than the vector layer
          }
        }
      });
    }
  },

  _setFeaturesProcessCallback(leafletObject) {
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    leafletObject.on('load', (loaded) => {
      let promise = this._featuresProcessCallback(loaded.layers, leafletObject);
      if (loaded.results && Ember.isArray(loaded.results)) {
        loaded.results.push(promise);
      }
    });
  },

  _featuresProcessCallback(layers, leafletObject) {
    return new Ember.RSVP.Promise((resolve) => {
      if (!leafletObject) {
        leafletObject = this.get('_leafletObject');
      }

      if (!layers) {
        resolve();
        leafletObject.fire('loadCompleted');
        return;
      }

      let featuresProcessCallback = Ember.get(leafletObject, 'featuresProcessCallback');
      if (typeof featuresProcessCallback === 'function') {
        layers.forEach((feature) => {
          feature.layerModel = this.get('layerModel');
        });
      }

      let p = typeof featuresProcessCallback === 'function' ? featuresProcessCallback(layers) : Ember.RSVP.resolve();
      p.then(() => {
        this._addLayersOnMap(layers, leafletObject);

        if (this.get('labelSettings.signMapObjects')) {
          this._addLabelsToLeafletContainer(layers, leafletObject);
        }

        leafletObject.fire('loadCompleted');
        resolve();
      });
    });
  },

  /**
    Add layers after features callback

    @method _addLayersOnMap
    @private
  */
  _addLayersOnMap(layers) {
    this._setLayerState();
  },

  /**
    Sets leaflet layer's opacity.

    @method _setLayerOpacity
    @private
  */
  _setLayerOpacity() {
    let config = Ember.getOwner(this).resolveRegistration('config:environment');
    let maxGeomOpacity = Number(config.userSettings.maxGeometryOpacity);
    let maxGeomFillOpacity = Number(config.userSettings.maxGeometryFillOpacity);

    let opacity = this.get('opacity');
    if (Ember.isNone(opacity)) {
      return;
    }

    let leafletLayer = this.get('_leafletObject');
    if (Ember.isNone(leafletLayer)) {
      return;
    }

    // Some layers-styles hide some of layers with their opacity set to 0, so we don't change such layers opacity here.
    let layersStylesRenderer = this.get('_layersStylesRenderer');
    let styleSettings = this.get('styleSettings');
    let visibleLeafletLayers = Ember.isNone(styleSettings) ?
      [leafletLayer] :
      layersStylesRenderer.getVisibleLeafletLayers({ leafletLayer, styleSettings });

    for (let i = 0, len = visibleLeafletLayers.length; i < len; i++) {
      setLeafletLayerOpacity({ leafletLayer: visibleLeafletLayers[i], opacity, maxGeomOpacity, maxGeomFillOpacity });
    }
  },
  /**
    Returns array of default layer localized properties.

    @method getDefaultLocalizedProperties
    @private
  */
  getDefaultLocalizedProperties() {
    return Ember.A(['intersectionArea']);
  },
  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions(source) {
    return this._super(...arguments).then((attributesOptions) => {
      let leafletObject = Ember.get(attributesOptions, 'object');

      // Return original vector layer for 'flexberry-layers-attributes-panel' component instead of marker cluster group.
      if (leafletObject instanceof L.MarkerClusterGroup) {
        Ember.set(attributesOptions, 'object', leafletObject._originalVectorLayer);
      }

      Ember.set(attributesOptions, 'settings.styleSettings', this.get('styleSettings'));

      let excluded = Ember.get(attributesOptions, 'settings.excludedProperties');

      if (Ember.isNone(excluded)) {
        excluded = Ember.A();
      }

      ['shape', 'isFavorite', 'favUpdating'].forEach((p) => {
        if (!excluded.contains(p)) {
          excluded.pushObject(p);
        }
      });

      Ember.set(attributesOptions, 'settings.excludedProperties', excluded);

      return attributesOptions;
    }.bind(this));
  },

  /**
    Creates leaflet vector layer related to layer type.

    @method createVectorLayer
    @param {Object} options Layer options.
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    assert('BaseVectorLayer\'s \'createVectorLayer\' should be overridden.');
  },

  /**
    Creates read format for the specified leaflet vector layer.

    @method createReadFormat
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>} Leaflet layer.
    @returns {Object} Read format.
  */
  createReadFormat(vectorLayer) {
    let crs = this.get('crs');
    let geometryField = 'geometry';
    let readFormat = new L.Format.GeoJSON({ crs, geometryField });

    let layerPropertiesDescription = ``;
    let layerClass = Ember.getOwner(this).lookup(`layer:${this.get('layerModel.type')}`);
    let layerProperties = layerClass.getLayerProperties(vectorLayer);
    for (let i = 0, len = layerProperties.length; i < len; i++) {
      let layerProperty = layerProperties[i];
      let layerPropertyValue = layerClass.getLayerPropertyValues(vectorLayer, layerProperty, 1)[0];

      let layerPropertyType = typeof layerPropertyValue;
      switch (layerPropertyType) {
        case 'boolean':
          layerPropertyType = 'boolean';
          break;
        case 'number':
          layerPropertyType = 'decimal';
          break;
        case 'object':
          layerPropertyType = layerPropertyValue instanceof Date ? 'date' : 'string';
          break;
        default:
          layerPropertyType = 'string';
      }

      layerPropertiesDescription += `<xsd:element maxOccurs="1" minOccurs="0" name="${layerProperty}" nillable="true" type="xsd:${layerPropertyType}"/>`;
    }

    let describeFeatureTypeResponse = `` +
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<xsd:schema xmlns:gml="http://www.opengis.net/gml" ` +
      `xmlns:flexberry="http://flexberry.ru" ` +
      `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
      `elementFormDefault="qualified" ` +
      `targetNamespace="http://flexberry.ru">` +
      `<xsd:import namespace="http://www.opengis.net/gml" schemaLocation="http://flexberry.ru/schemas/gml/3.1.1/base/gml.xsd"/>` +
      `<xsd:complexType name="layerType">` +
      `<xsd:complexContent>` +
      `<xsd:extension base="gml:AbstractFeatureType">` +
      `<xsd:sequence>` +
      `${layerPropertiesDescription}` +
      `<xsd:element maxOccurs="1" minOccurs="0" name="${geometryField}" nillable="true" type="gml:GeometryPropertyType"/>` +
      `</xsd:sequence>` +
      `</xsd:extension>` +
      `</xsd:complexContent>` +
      `</xsd:complexType>` +
      `<xsd:element name="layer" substitutionGroup="gml:_Feature" type="flexberry:layerType"/>` +
      `</xsd:schema>`;

    let describeFeatureTypeXml = L.XmlUtil.parseXml(describeFeatureTypeResponse);
    let featureInfo = describeFeatureTypeXml.documentElement;
    readFormat.setFeatureDescription(featureInfo);
    readFormat.excludedProperties = [];

    return readFormat;
  },

  /**
    Clusterizes created vector layer if 'clusterize' option is enabled.

    @method createClusterLayer
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>} vectorLayer Vector layer which must be clusterized.
    @return {<a href="https://github.com/Leaflet/Leaflet.markercluster/blob/master/src/MarkerClusterGroup.js">L.MarkerClusterGroup</a>} Clusterized vector layer.
  */
  createClusterLayer(vectorLayer) {
    let clusterLayer = L.markerClusterGroup(this.get('clusterOptions'));

    // Original vector layer is necessary for 'flexberry-layers-attributes-panel' component and identification map tool
    clusterLayer._originalVectorLayer = vectorLayer;

    // Features loading of original vectorLayer does not trigger parent's clusterLayer.addLayer(), link explicitly
    clusterLayer._originalVectorLayer.on('layeradd', this.loadClusterLayer, this);
    clusterLayer._originalVectorLayer.on('layerremove', this.loadClusterLayer, this);

    // Apply display settings for clustered features.
    clusterLayer._featureGroup.on('layeradd', this.updateClusterLayer, this);
    clusterLayer._featureGroup.on('layerremove', this.updateClusterLayer, this);

    clusterLayer.addLayer(vectorLayer);

    return clusterLayer;
  },
  /**
    Apply display settings for clustered objects. Updating the visibility of the feature labels, opacity.

    @method updateClusterLayer
    @param {Object} e action context.
  */
  updateClusterLayer(e) {
    this._setLayerOpacity();

    if (!e || !e.layer || !e.type) {
      return;
    }

    if (e.layer instanceof L.MarkerCluster) {
      return;
    }

    let leafletMap = this.get('leafletMap');
    let layerLabel = e.layer._label;

    if (e.type === 'layeradd') {
      if (!leafletMap.hasLayer(layerLabel)) {
        leafletMap.addLayer(layerLabel);
      }

    } else {
      if (leafletMap.hasLayer(e.layer._label)) {
        leafletMap.removeLayer(e.layer._label);
      }
    }
  },

  /**
    Synchronizes ClusterLayer._originalVectorLayer._layers with ClusterLayer layers.
    This is required when continueLoading option.

    @method loadClusterLayer
    @param {Object} e action context.
  */
  loadClusterLayer(e) {
    if (!e || !e.layer) {
      return;
    }

    if (e.type === 'layeradd') {
      Ember.run.once(this, 'addClusterLayer', e);
      return;
    }

    let clusterLayer = this.get('_leafletObject');
    if (clusterLayer instanceof L.MarkerClusterGroup) {
      return;
    }

    clusterLayer.removeLayer(e.layer);
  },

  /**
    Adds ClusterLayer layers.

    @method addClusterLayer
    @param {Object} e action context.
  */
  addClusterLayer(e) {
    if (!e || !e.target) {
      console.error('Unable to update clusterLayer');
      return;
    }

    let clusterLayer = this.get('_leafletObject');
    let leafletMap = this.get('leafletMap');
    if (!(clusterLayer instanceof L.MarkerClusterGroup)) {
      return;
    }

    let updatedOriginalVectorLayer = e.target;
    clusterLayer.addLayer(updatedOriginalVectorLayer);

    // L.MarkerClusterGroup includes both child L.MarkerCluster and L.Marker in _featureGroup after originalVectorLayer addition
    let clusterMarkers = clusterLayer._featureGroup.getLayers().filter(layer => layer instanceof L.MarkerCluster);

    clusterMarkers.forEach(clusterMarker => {
      // For L.MarkerCluster there is an option to get clustered markers
      clusterMarker.getAllChildMarkers()
        .filter(markerLayer => leafletMap.hasLayer(markerLayer._label))
        .map(markerLayerWithLabel => leafletMap.removeLayer(markerLayerWithLabel._label));
    });

    this._setLayerState(); // Accept layer style options for new loaded features
  },

  /**
    Destroys clusterized leaflet layer related to layer type.

    @method destroyLayer
  */
  destroyClusterLayer(clusterLayer) {
    clusterLayer._featureGroup.off('layeradd', this.updateClusterLayer, this);
    clusterLayer._featureGroup.off('layerremove', this.updateClusterLayer, this);
    clusterLayer._originalVectorLayer.off('layeradd', this.loadClusterLayer, this);
    clusterLayer._originalVectorLayer.off('layerremove', this.loadClusterLayer, this);
  },

  /*
    Get the field to search for objects
    @method getPkField
    @param {Object} layer.
    @return {String} Field name.
  */
  getPkField(layer) {
    const getPkField = this.get('mapApi').getFromApi('getPkField');
    if (typeof getPkField === 'function') {
      return getPkField(layer);
    }

    let field = Ember.get(layer, 'settingsAsObject.pkField');
    return Ember.isNone(field) ? 'primarykey' : field;
  },

  /**
    Show all layer objects.
    @method showAllLayerObjects
    @return {Promise}
  */
  showAllLayerObjects() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let map = this.get('leafletMap');
      let layer = this.get('layerModel');

      let continueLoading = leafletObject.options.continueLoading;
      if (!continueLoading) {
        if (!Ember.isNone(leafletObject)) {
          leafletObject.eachLayer((layerShape) => {
            if (map.hasLayer(layerShape)) {
              map.removeLayer(layerShape);
            }
          });
          if (!leafletObject.options.showExisting) {
            leafletObject.clearLayers();
          }
        }

        leafletObject.promiseLoadLayer = new Ember.RSVP.Promise((resolve) => {
          let e = {
            featureIds: null
          };

          leafletObject.loadLayerFeatures(e).then(() => {
            resolve('Features loaded');
          });
        });
      } else {
        leafletObject.showLayerObjects = true;
        leafletObject.statusLoadLayer = true;

        this.continueLoad(leafletObject);
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
        let _labelsLayer = leafletObject._labelsLayer;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(_labelsLayer) && map.hasLayer(_labelsLayer)) {
          _labelsLayer.eachLayer(function (labelLayer) {
            if (!map.hasLayer(labelLayer)) {
              map.addLayer(labelLayer);
            }
          });
        }

        let additionalZoomLabel = leafletObject.additionalZoomLabel;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(additionalZoomLabel)) {
          additionalZoomLabel.forEach(zoomLabels => {
            if (map.hasLayer(zoomLabels)) {
              zoomLabels.eachLayer(function (labelLayer) {
                if (!map.hasLayer(labelLayer)) {
                  map.addLayer(labelLayer);
                }
              });
            }
          });
        }

        resolve('success');
      });
    });
  },

  /**
    Hide all layer objects.
    @method hideAllLayerObjects
    @return nothing
  */
  hideAllLayerObjects() {
    let leafletObject = this.get('_leafletObject');
    let map = this.get('leafletMap');
    let layer = this.get('layerModel');

    leafletObject.showLayerObjects = false;

    leafletObject.eachLayer(function (layerShape) {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
      }
    });
    let _labelsLayer = leafletObject._labelsLayer;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(_labelsLayer) && map.hasLayer(_labelsLayer)) {
      _labelsLayer.eachLayer(function (labelLayer) {
        if (map.hasLayer(labelLayer)) {
          map.removeLayer(labelLayer);
        }
      });
    }

    let additionalZoomLabel = leafletObject.additionalZoomLabel;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(additionalZoomLabel)) {
      additionalZoomLabel.forEach(zoomLabels => {
        if (map.hasLayer(zoomLabels)) {
          zoomLabels.eachLayer(function (labelLayer) {
            if (!map.hasLayer(labelLayer)) {
              map.removeLayer(labelLayer);
            }
          });
        }
      });
    }
  },

  /**
    Determine the visibility of the specified objects by id for the layer.
    @method _setVisibilityObjects
    @param {string[]} objectIds Array of objects IDs.
    @param {boolean} [visibility=false] visibility Object Visibility.
    @return {Ember.RSVP.Promise}
  */
  _setVisibilityObjects(objectIds, visibility = false) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let map = this.get('leafletMap');
      let layer = this.get('layerModel');

      if (visibility) {
        let continueLoading = leafletObject.options.continueLoading;
        if (!continueLoading) {
          leafletObject.promiseLoadLayer = new Ember.RSVP.Promise((resolve) => {
            let e = {
              featureIds: objectIds
            };

            leafletObject.loadLayerFeatures(e).then(() => {
              resolve('Features loaded');
            });
          });
        } else {
          reject('Not working to layer with continueLoading');
        }
      } else {
        leafletObject.promiseLoadLayer = Ember.RSVP.resolve();
      }

      leafletObject.promiseLoadLayer.then(() => {
        leafletObject.statusLoadLayer = false;
        leafletObject.promiseLoadLayer = null;
        objectIds.forEach(objectId => {
          let objects = Object.values(leafletObject._layers).filter(shape => {
            return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layer, shape) === objectId;
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

        let additionalZoomLabel = leafletObject.additionalZoomLabel;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(additionalZoomLabel)) {
          objectIds.forEach(objectId => {
            additionalZoomLabel.forEach(zoomLabels => {
              let objects = Object.values(zoomLabels._layers).filter(shape => {
                return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layer, shape) === objectId;
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
          });
        }

        let _labelsLayer = leafletObject._labelsLayer;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(_labelsLayer)) {
          objectIds.forEach(objectId => {
            let objects = Object.values(_labelsLayer._layers).filter(shape => {
              return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layer, shape) === objectId;
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

        resolve('success');
      });
    });
  },

  /**
    Get nearest object.
    Gets all leaflet layer objects and processes them _calcNearestObject().

    @method getNearObject
    @param {Object} e Event object..
    @param {Object} featureLayer Leaflet layer object.
    @param {Number} featureId Leaflet layer object id.
    @param {Number} layerObjectId Leaflet layer id.
    @return {Ember.RSVP.Promise} Returns object with distance, layer model and nearest leaflet layer object.
  */
  getNearObject(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = {
        featureIds: null
      };
      this.getLayerFeatures(features)
        .then((featuresLayer) => {
          if (Ember.isArray(featuresLayer) && featuresLayer.length > 0) {
            resolve(this._calcNearestObject(featuresLayer, e));
          } else {
            resolve('Nearest object not found');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
    Calculates nearest object.
    Iterates all objects and calculates min distance. If it searches for nearest object in same layer, it is excluded e.featureLayer.

    @method getNearObject
    @param {Array} featuresLayer Leaflet layer objects.
    @param {Object} e Event object..
    @param {Object} featureLayer Leaflet layer object.
    @param {Number} featureId Leaflet layer object id.
    @param {Number} layerObjectId Leaflet layer id.
    @return {Ember.RSVP.Promise} Returns object with distance, layer model and nearest leaflet layer object.
  */
  _calcNearestObject(featuresLayer, e) {
    let result = null;
    let mapApi = this.get('mapApi').getFromApi('mapModel');
    let layerModel = this.get('layerModel');
    let layerId = layerModel.get('id');
    featuresLayer.forEach(obj => {
      let leafletLayer = Ember.isNone(obj.leafletLayer) ? obj : obj.leafletLayer;
      const id = mapApi._getLayerFeatureId(layerModel, leafletLayer);
      if (layerId === e.layerObjectId && e.featureId === id) {
        return;
      }

      const distance = mapApi._getDistanceBetweenObjects(e.featureLayer, leafletLayer);
      if (Ember.isNone(result) || distance < result.distance) {
        result = {
          distance: distance,
          layer: layerModel,
          object: leafletLayer,
        };
      }
    });
    return result;
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @return {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.hash({
        vectorLayer: this.createVectorLayer()
      }).then(({ vectorLayer }) => {
        // Read format contains 'DescribeFeatureType' metadata and is necessary for 'flexberry-layers-attributes-panel' component.
        let readFormat = vectorLayer.readFormat;
        if (Ember.isNone(readFormat)) {
          // For combine layer
          if (!Ember.isNone(this.dynamicProperties) && !Ember.isNone(this.dynamicProperties.type)) {
            vectorLayer.type = this.dynamicProperties.type;
          }

          vectorLayer.readFormat = this.createReadFormat(vectorLayer);
        }

        vectorLayer.minZoom = this.get('minZoom');
        vectorLayer.maxZoom = this.get('maxZoom');

        vectorLayer.getContainer = this.get('_getContainer').bind(this);
        vectorLayer.getPkField = this.get('getPkField').bind(this);
        vectorLayer.showAllLayerObjects = this.get('showAllLayerObjects').bind(this);
        vectorLayer.hideAllLayerObjects = this.get('hideAllLayerObjects').bind(this);
        vectorLayer._setVisibilityObjects = this.get('_setVisibilityObjects').bind(this);

        if (Ember.isNone(vectorLayer.loadLayerFeatures)) {
          Ember.set(vectorLayer, 'loadLayerFeatures', this.loadLayerFeatures.bind(this));
        }

        if (this.get('clusterize')) {
          let clusterLayer = this.createClusterLayer(vectorLayer);
          resolve(clusterLayer);
        } else {
          resolve(vectorLayer);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Destroys leaflet layer related to layer type.

    @method destroyLayer
  */
  destroyLayer() {
    let leafletLayer = this.get('_leafletObject');
    if (leafletLayer instanceof L.MarkerClusterGroup) {
      this.destroyClusterLayer(leafletLayer);
    }
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.

    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} polygonLayer Polygon layer related to given area.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify(e) {
    let primitiveSatisfiesBounds = (primitive, bounds) => {
      let satisfiesBounds = false;

      if (typeof primitive.forEach === 'function') {
        primitive.forEach(function (nestedGeometry, index) {
          if (satisfiesBounds) {
            return;
          }

          let nestedPrimitive = this.get(index);
          satisfiesBounds = primitiveSatisfiesBounds(nestedPrimitive, bounds);
        });
      } else {
        satisfiesBounds = primitive.within(bounds) || primitive.intersects(bounds);
      }

      return satisfiesBounds;
    };

    return new Ember.RSVP.Promise((resolve, reject) => {
      try {
        let features = Ember.A();
        let bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());
        let leafletLayer = this.get('_leafletObject');
        let mapModel = this.get('mapApi').getFromApi('mapModel');
        let scale = this.get('mapApi').getFromApi('precisionScale');
        leafletLayer.eachLayer(function (layer) {
          let geoLayer = layer.toGeoJSON();
          let primitive = new Terraformer.Primitive(geoLayer.geometry);

          if (primitiveSatisfiesBounds(primitive, bounds)) {
            if (geoLayer.geometry.type === 'GeometryCollection') {
              geoLayer.geometry.geometries.forEach(feat => {
                let geoObj = { type: 'Feature', geometry: feat };
                features.pushObject(featureWithAreaIntersect(e.polygonLayer.toGeoJSON(), geoObj, leafletLayer, mapModel, scale));
              });
            } else {
              features.pushObject(featureWithAreaIntersect(e.polygonLayer.toGeoJSON(), geoLayer, leafletLayer, mapModel, scale));
            }
          }
        });

        resolve(features);
      } catch (e) {
        reject(e.error || e);
      }
    });
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
    @param {Object[]} layer Object describing layer that must be searched.
    @param {Object} searchOptions Search options related to layer type.
    @param {Object} results Hash containing search results.
    @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';
      let leafletLayer = this.get('_leafletObject');
      let features = Ember.A();

      let searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || Ember.A();

      // If single search field provided - transform it into array.
      if (!Ember.isArray(searchFields)) {
        searchFields = Ember.A([searchFields]);
      }

      leafletLayer.eachLayer((layer) => {
        if (features.length < e.searchOptions.maxResultsCount) {
          let feature = Ember.get(layer, 'feature');

          // if layer satisfies search query
          let contains = false;
          searchFields.forEach((field) => {
            if (feature && (feature.properties[field])) {
              contains = contains || feature.properties[field].toLowerCase().includes(e.searchOptions.queryString.toLowerCase());
            }
          });

          if (contains) {
            let foundFeature = layer.toGeoJSON();
            foundFeature.leafletLayer = L.geoJson(foundFeature);
            features.pushObject(foundFeature);
          }
        }
      });
      resolve(features);
    });
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.

    @method _query
    @param {Object} e Event object.
    @param {Object} queryFilter Object with query filter paramteres
    @param {Object[]} results.features Array containing leaflet layers objects
    or a promise returning such array.
  */
  query(layerLinks, e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let queryFilter = e.queryFilter;
      let features = Ember.A();
      let equals = [];

      layerLinks.forEach((link) => {
        let linkParameters = link.get('parameters');

        if (Ember.isArray(linkParameters) && linkParameters.length > 0) {
          linkParameters.forEach(linkParam => {
            let property = linkParam.get('layerField');
            let propertyValue = queryFilter[linkParam.get('queryKey')];

            equals.push({ 'prop': property, 'value': propertyValue });
          });
        }
      });

      let leafletLayer = this.get('_leafletObject');
      leafletLayer.eachLayer((layer) => {
        let feature = Ember.get(layer, 'feature');
        let meet = true;
        equals.forEach((equal) => {
          meet = meet && Ember.isEqual(feature.properties[equal.prop], equal.value);
        });

        if (meet) {
          features.pushObject(layer.toGeoJSON());
        }
      });

      resolve(features);
    });
  },

  /**
    Handles 'flexberry-map:loadLayerFeatures' event of leaflet map.

    @method loadLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  loadLayerFeatures(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      resolve(this.get('_leafletObject'));
    });
  },

  /**
    Handles 'flexberry-map:getLayerFeatures' event of leaflet map.

    @method getLayerFeatures
    @param {Object} e Event object.
    @returns {Ember.RSVP.Promise} Returns promise.
  */
  getLayerFeatures(e) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = this.get('_leafletObject');
      let featureIds = e.featureIds;
      if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
        let objects = [];
        featureIds.forEach((id) => {
          let features = leafletObject._layers;
          let obj = Object.values(features).find(feature => {
            return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(this.get('layerModel'), feature) === id;
          });
          if (!Ember.isNone(obj)) {
            objects.push(obj);
          }
        });
        resolve(objects);
      } else {
        resolve(Object.values(leafletObject._layers));
      }
    });
  },

  /**
    Handles 'flexberry-map:getOrLoadLayerFeatures' event of leaflet map.

    @method _getOrLoadLayerFeatures
    @param {Object} e Event object.
    @returns {Object[]} results Objects.
  */
  _getOrLoadLayerFeatures(e) {
    if (this.get('layerModel.id') !== e.layer) {
      return;
    }

    e.results.push({
      layerModel: this.get('layerModel'),
      leafletObject: this.get('_leafletObject'),
      features: e.load ? this.loadLayerFeatures(e) : this.getLayerFeatures(e)
    });
  },

  /**
    Handles zoomend
  */
  continueLoad() {
  },

  /**
    Handles 'flexberry-map:continueLoad' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {Object} layerModel Object describing layer that must be continueLoad.
    @param {Object} results Hash containing promise.
  */
  _continueLoad(e) {
    let shouldContinueLoad = Ember.A(e.layers || []).contains(this.get('layerModel'));
    if (!shouldContinueLoad) {
      return;
    }

    // Call public identify method, if layer should be continueLoad.
    e.results.push({
      layerModel: this.get('layerModel'),
      promise: this.continueLoad(this.get('_leafletObject'))
    });
  },

  /*
    Clear changes. Needs for CancelEdit and Reload
  */
  clearChanges() {
  },

  reload() {
    this.clearChanges();

    let leafletObject = this.get('_leafletObject');
    let map = this.get('leafletMap');

    leafletObject.eachLayer((layerShape) => {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
      }
    });
    leafletObject.clearLayers();

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
      !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
      leafletObject._labelsLayer.eachLayer((layerShape) => {
        if (map.hasLayer(layerShape)) {
          map.removeLayer(layerShape);
        }
      });
      leafletObject._labelsLayer.clearLayers();
    }

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('additionalZoomLabel')) &&
      !Ember.isNone(this.get('_leafletObject.additionalZoomLabel'))) {
      this.get('additionalZoomLabel').forEach(zoomLabels => {
        zoomLabels.eachLayer((layerShape) => {
          if (map.hasLayer(layerShape)) {
            map.removeLayer(layerShape);
          }
        });
        zoomLabels.clearLayers();
      });
    }

    this.set('loadedBounds', null);
    let load = this.continueLoad();

    return load && load instanceof Ember.RSVP.Promise ? load : Ember.RSVP.resolve();
  },

  /**
    Adds a listener function to leafletMap.

    @method onLeafletMapEvent
    @return nothing.
  */
  onLeafletMapEvent() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);
      leafletMap.on('zoomend', this._checkZoomPane, this);
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    this.onLeafletMapEvent();
  },

  /**
    Switches pane depending on the zoom.

    @method _checkZoomPane
    @private
  */
  _checkZoomPane() {
    let leafletObject = this.get('_leafletObject');
    let thisPane = this.get('_pane');
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap) && thisPane && !Ember.isNone(leafletObject)) {
      let pane = leafletMap.getPane(thisPane);
      let mapPane = leafletMap._mapPane;
      if (!Ember.isNone(mapPane) && !Ember.isNone(pane)) {
        let existPaneDomElem = Ember.$(mapPane).children(`[class*='${thisPane}']`).length;
        if (existPaneDomElem > 0 && !checkMapZoom(leafletObject)) {
          L.DomUtil.remove(pane);
        } else if (existPaneDomElem === 0 && checkMapZoom(leafletObject)) {
          mapPane.appendChild(pane);
        }
      }
    }

    let thisPaneLabel = this.get('_paneLabel');
    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(leafletMap) && thisPaneLabel && !Ember.isNone(leafletObject)) {
      let pane = leafletMap.getPane(thisPaneLabel);
      let labelsLayer = this.get('_labelsLayer');
      let mapPane = leafletMap._mapPane;
      if (!Ember.isNone(mapPane) && !Ember.isNone(pane) && !Ember.isNone(labelsLayer)) {
        let existPaneDomElem = Ember.$(mapPane).children(`[class*='${thisPaneLabel}']`).length;
        if (existPaneDomElem > 0 && !checkMapZoom(labelsLayer)) {
          L.DomUtil.remove(pane);
        } else if (existPaneDomElem === 0 && checkMapZoom(labelsLayer)) {
          mapPane.appendChild(pane);
        }
      }
    }

    let additionalZoomLabel = this.get('additionalZoomLabel');
    if (additionalZoomLabel) {
      additionalZoomLabel.forEach(additionalZoom => {
        let _paneLabel = additionalZoom._paneLabel;
        if (this.get('labelSettings.signMapObjects') && !Ember.isNone(leafletMap) && _paneLabel && !Ember.isNone(leafletObject)) {
          let pane = leafletMap.getPane(_paneLabel);
          let mapPane = leafletMap._mapPane;
          if (!Ember.isNone(mapPane) && !Ember.isNone(pane) && !Ember.isNone(additionalZoom)) {
            let existPaneDomElem = Ember.$(mapPane).children(`[class*='${_paneLabel}']`).length;
            if (existPaneDomElem > 0 && !checkMapZoom(additionalZoom)) {
              L.DomUtil.remove(pane);
            } else if (existPaneDomElem === 0 && checkMapZoom(additionalZoom)) {
              mapPane.appendChild(pane);
            }
          }
        }
      });
    }
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);

      if (this.get('typeGeometry') === 'polyline') {
        leafletMap.off('zoomend', this._updatePositionLabelForLine, this);
      }

      if (this.get('showExisting') !== false) {
        leafletMap.off('moveend', this._showLabelsMovingMap, this);
      }
    }
  },

  _createLayer() {
    this._super(...arguments);

    this.get('_leafletLayerPromise').then((leafletLayer) => {
      this._checkZoomPane();
    });
  },

  /**
    Switches labels layer's minScaleRange.

    @method _zoomMinDidChange
    @private
  */
  _zoomMinDidChange: Ember.observer('labelSettings.scaleRange.minScaleRange', function () {
    let minZoom = this.get('labelSettings.scaleRange.minScaleRange');
    let _labelsLayer = this.get('_labelsLayer');
    if (!Ember.isNone(_labelsLayer) && !Ember.isNone(minZoom)) {
      _labelsLayer.minZoom = minZoom;
      this._checkZoomPane();
    }
  }),

  /**
    Switches labels layer's maxScaleRange.

    @method _zoomMaxDidChange
    @private
  */
  _zoomMaxDidChange: Ember.observer('labelSettings.scaleRange.maxScaleRange', function () {
    let maxZoom = this.get('labelSettings.scaleRange.maxScaleRange');
    let _labelsLayer = this.get('_labelsLayer');
    if (!Ember.isNone(_labelsLayer) && !Ember.isNone(maxZoom)) {
      _labelsLayer.maxZoom = maxZoom;
      this._checkZoomPane();
    }
  }),

  /**
    Create array of strings and feature properies.

    @method _applyProperty
    @param {String} str String for parsing
    @param {Object} layer layer
    @return {String} string with replaced property
  */
  _applyProperty(str, layer) {
    let hasReplace = false;
    let propName;

    let leafletObject = this.get('_leafletObject');

    // Clustering vector layer contains the leaflet's main context in the "_leafletObject._originalVectorLayer" path
    if (leafletObject instanceof L.MarkerClusterGroup) {
      leafletObject = this.get('_leafletObject._originalVectorLayer');
    }

    try {
      propName = Ember.$('<p>' + str + '</p>').find('propertyname');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      propName = Ember.$('<p>' + str + '</p>').find('propertyname');
    }

    if (propName.length === 0) { // if main node
      propName = Ember.$('<p>' + str + '</p> propertyname');
    }

    if (propName.length > 0) {
      for (var prop of propName) {
        let property = prop.innerHTML;
        if (prop.localName !== 'propertyname') {
          property = prop.innerText;
        }

        if (property && layer.feature.properties && layer.feature.properties.hasOwnProperty(property)) {
          let readFormat = Ember.get(leafletObject, 'readFormat.featureType.fieldTypes');

          let label = layer.feature.properties[property];
          let dateTimeFormat = this.displaySettings.dateTimeFormat;
          let dateFormat = this.displaySettings.dateFormat;
          if (readFormat[property] === 'date' && (!Ember.isEmpty(dateFormat) || !Ember.isEmpty(dateTimeFormat))) {
            let dateValue = moment(label);

            if (dateValue.isValid()) {
              if (!Ember.isEmpty(dateTimeFormat)) {
                label = (dateValue.format('HH:mm:ss') === '00:00:00') ? dateValue.format(dateFormat) : dateValue.format(dateTimeFormat);
              } else {
                label = dateValue.format(dateFormat);
              }
            }
          }

          if (Ember.isNone(label)) {
            label = '';
          }

          str = str.replace(prop.outerHTML, label);
        }
      }
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    } else {
      return str;
    }
  },

  /**
    Apply function.

    @method _applyFunction
    @param {String} str String for parsing
    @return {String} string with applied and replaced function
  */
  _applyFunction(str) {
    let func;
    let hasReplace = false;

    try {
      func = Ember.$('<p>' + str + '</p>').find('function');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      func = Ember.$('<p>' + str + '</p>').find('function');
    }

    if (func.length === 0) { // if main node
      func = Ember.$('<p>' + str + '</p> function');
    }

    if (func.length > 0) {
      for (var item of func) {
        let nameFunc = Ember.$(item).attr('name');
        if (!Ember.isNone(nameFunc)) {
          nameFunc = Ember.$(item).attr('name').replaceAll('\\"', '');
          switch (nameFunc) {
            case 'toFixed':
              let attr = Ember.$(item).attr('attr').replaceAll('\\"', '');
              let property = item.innerHTML;
              let numProp = Number.parseFloat(property);
              let numAttr = Number.parseFloat(attr);
              if (!Ember.isNone(attr) && !Ember.isNone(property) && !Number.isNaN(numProp) && !Number.isNaN(numAttr)) {
                let newStr = numProp.toFixed(numAttr);
                str = str.replace(item.outerHTML, newStr);
              }

              break;
          }
        }
      }
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    } else {
      return str;
    }
  },

  /**
    Show labels when map moving
    @method _showLabelsMovingMap
  */
  _showLabelsMovingMap() {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    let _labelsLayer = this.get('_labelsLayer');
    let leafletObject = this.get('_leafletObject');
    if (this.get('leafletMap').hasLayer(_labelsLayer) && leafletObject) {
      this._createStringLabel(leafletObject.getLayers(), _labelsLayer, additionalZoomLabel);
    }
  },

  /**
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Array} layers new layers for add labels
    @param {Object} additionalZoomLabel Array with labels layers
    @param {Object} labelsLayer Labels layer with not multi labels
  */
  _createStringLabel(layers, labelsLayer, additionalZoomLabel) {
    let optionsLabel = this.get('labelSettings.options');
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    let style = Ember.String.htmlSafe(
      `font-family: ${Ember.get(optionsLabel, 'captionFontFamily')}; ` +
      `font-size: ${Ember.get(optionsLabel, 'captionFontSize')}px; ` +
      `font-weight: ${Ember.get(optionsLabel, 'captionFontWeight')}; ` +
      `font-style: ${Ember.get(optionsLabel, 'captionFontStyle')}; ` +
      `text-decoration: ${Ember.get(optionsLabel, 'captionFontDecoration')}; ` +
      `color: ${Ember.get(optionsLabel, 'captionFontColor')}; ` +
      `text-align: ${Ember.get(optionsLabel, 'captionFontAlign')}; `);

    let leafletMap = this.get('leafletMap');
    let bbox = leafletMap.getBounds();
    if (layers) {
      let additionalLabelLayer = null;
      if (additionalZoomLabel) {
        let zoom = this.get('leafletMap').getZoom();
        let aLayers = additionalZoomLabel.filter(l => { return (l.minZoom == null || l.minZoom <= zoom) && (l.maxZoom == null || l.maxZoom >= zoom); });

        if (aLayers.length > 0) {
          additionalLabelLayer = aLayers[0];
        }
      }

      layers.forEach((layer) => {
        let currentLabelExists = false;
        if (additionalLabelLayer) {
          currentLabelExists = layer._labelAdditional && layer._labelAdditional.filter(label => {
            return label.zoomCheck === additionalLabelLayer.check;
          }).length > 0;
        } else {
          currentLabelExists = !Ember.isNone(layer._label);
        }

        let showExisting = this.get('showExisting');
        let intersectBBox = layer.getBounds ? bbox.intersects(layer.getBounds()) : bbox.contains(layer.getLatLng());
        let staticLoad = showExisting !== false && intersectBBox;
        if (!currentLabelExists && (showExisting === false || staticLoad)) {
          let label = layer.labelValue || this._applyFunction(this._applyProperty(labelSettingsString, layer));
          this._createLabel(label, layer, style, labelsLayer, additionalLabelLayer);
        }
      });
    }
  },

  /**
    Create label for object of layer.

    @method _createLabel
    @param {String} text
    @param {Object} layer
    @param {String} style
    @param {Object} labelsLayer
    @param {Object} additionalZoomLabel
  */
  _createLabel(text, layer, style, labelsLayer, additionalLabelLayer) {
    if (Ember.isEmpty(text) || Ember.isEmpty(layer)) {
      return;
    }

    let lType = layer.toGeoJSON().geometry.type;

    if (lType.indexOf('Polygon') !== -1) {
      this._createLabelForPolygon(text, layer, style, labelsLayer, additionalLabelLayer);
    }

    if (lType.indexOf('Point') !== -1) {
      this._createLabelForPoint(text, layer, style, labelsLayer);
    }

    if (lType.indexOf('LineString') !== -1) {
      this._createLabelForPolyline(text, layer, style, labelsLayer, additionalLabelLayer);
    }
  },

  _createLabelForPoint(text, layer, style, labelsLayer) {
    let latlng = layer.getLatLng();
    let iconWidth = 30;
    let iconHeight = 30;
    let positionPoint = this._setPositionPoint(iconWidth, iconHeight);
    let anchor = positionPoint.anchor;
    let className = 'label';
    className += ' point ' + positionPoint.cssClass;
    let html = '<div style="' + style + positionPoint.style + '">' + text + '</div>';

    let label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, this.get('_paneLabel'));
    layer._label = label;

    if (!latlng) {
      return;
    }

    // adding labels to layers
    this._addLabelsToLayers(labelsLayer, label);
  },

  _createLabelForPolygon(text, layer, style, labelsLayer, additionalLabelLayer) {
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let anchor = null;
    let html = '';
    let label;

    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let className = 'label';

    let multi = additionalLabelLayer ? additionalLabelLayer.check === 'multi' : false;
    let objJsts = layer.toJsts(L.CRS.EPSG4326);

    try {
      if (multi) {
        let countGeometries = objJsts.getNumGeometries();
        if (countGeometries > 1) { // сюда попадаем только если нужны мультинадписи и по настройке и по факту
          label = L.featureGroup();
          for (let i = 0; i < countGeometries; i++) {
            let polygonN = objJsts.getGeometryN(i);
            let centroidNJsts = polygonN.isValid() ? polygonN.getInteriorPoint() : polygonN.getCentroid();

            let centroidN = geojsonWriter.write(centroidNJsts);
            latlng = L.latLng(centroidN.coordinates[1], centroidN.coordinates[0]);
            html = '<div style="' + style + '">' + text + '</div>';

            let labelN = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, additionalLabelLayer._paneLabel);
            label.addLayer(labelN);
          }

          label.feature = layer.feature;
          label.leafletMap = this.get('leafletMap');
          label.zoomCheck = additionalLabelLayer.check;
        }
      }

      // если либо нет настройки, либо нет составных частей
      if (!label) {
        let centroidJsts = objJsts.isValid() ? objJsts.getInteriorPoint() : objJsts.getCentroid();
        let centroid = geojsonWriter.write(centroidJsts);
        latlng = L.latLng(centroid.coordinates[1], centroid.coordinates[0]);
        html = '<div style="' + style + '">' + text + '</div>';

        let paneLabel = additionalLabelLayer ? additionalLabelLayer._paneLabel : this.get('_paneLabel');

        // возможно тут тоже надо будет сделать L.featureGroup()
        label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, paneLabel);

        if (additionalLabelLayer) {
          // остальное и так проставилось в _createLabelMarker (feature, leafletMap)
          label.zoomCheck = additionalLabelLayer.check; // флаг для поиска. переделать!
        }
      }
    }
    catch (e) {
      console.error(e.message + ': ' + layer.toGeoJSON().id);
    }

    if (!label) {
      return;
    }

    if (multi) {
      if (!layer._labelAdditional) {
        layer._labelAdditional = Ember.A();
      }

      layer._labelAdditional.addObject(label);
    } else {
      layer._label = label;
    }

    // adding labels to layers
    this._addLabelsToLayers(additionalLabelLayer || labelsLayer, label);
  },

  _createLabelForPolyline(text, layer, style, labelsLayer, additionalLabelLayer) {
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let anchor = null;
    let html = '';

    let label;
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let optionsLabel = this.get('labelSettings.options');
    let className = 'label';

    let multi = additionalLabelLayer ? additionalLabelLayer.check === 'multi' : false;

    try {
      let objJsts = layer.toJsts(L.CRS.EPSG4326);
      let countGeometries = objJsts.getNumGeometries();

      if (countGeometries > 1) { // для мультилинии у первого кусочка надпись будет вне зависимости от флага multi
        if (multi) {
          label = L.featureGroup();
          label.feature = layer.feature;
          label.leafletMap = this.get('leafletMap');
          label.zoomCheck = additionalLabelLayer.check;
        }

        for (let i = 0; i < (multi ? countGeometries : 1); i++) {
          let partlineJsts = objJsts.getGeometryN(i);
          let partlineGeoJson = geojsonWriter.write(partlineJsts);
          let partline = L.geoJSON(partlineGeoJson).getLayers()[0];

          let bboxJstsN = partlineJsts.getEnvelope();
          let bboxGeoJsonN = geojsonWriter.write(bboxJstsN);
          let bbox = L.geoJSON(bboxGeoJsonN).getLayers()[0];
          latlng = L.latLng(bbox._bounds._northEast.lat, bbox._bounds._southWest.lng);

          let options = {
            fillColor: Ember.get(optionsLabel, 'captionFontColor'),
            align: Ember.get(optionsLabel, 'captionFontAlign')
          };

          layer._svgConteiner = null;
          this._addTextForLine(layer, text, options, style, partline);
          iconWidth = 12;
          iconHeight = 12;
          html = Ember.$(layer._svgConteiner).html();

          if (multi) {
            let labelN = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, additionalLabelLayer._paneLabel);
            labelN._parentLayer = partline;

            label.addLayer(labelN);
          } else {
            label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, this.get('_paneLabel'));
          }
        }
      } else {
        latlng = L.latLng(layer._bounds._northEast.lat, layer._bounds._southWest.lng);
        let options = {
          fillColor: Ember.get(optionsLabel, 'captionFontColor'),
          align: Ember.get(optionsLabel, 'captionFontAlign')
        };

        this._addTextForLine(layer, text, options, style);
        iconWidth = 12;
        iconHeight = 12;
        html = Ember.$(layer._svgConteiner).html();

        let paneLabel = additionalLabelLayer ? additionalLabelLayer._paneLabel : this.get('_paneLabel');
        label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, paneLabel);

        if (multi) {
          label.zoomCheck = additionalLabelLayer.check;
        }
      }
    }
    catch (e) {
      console.error(e.message + ': ' + layer.toGeoJSON().id);
    }

    if (!label) {
      return;
    }

    if (multi) {
      if (!layer._labelAdditional) {
        layer._labelAdditional = Ember.A();
      }

      layer._labelAdditional.addObject(label);
    } else {
      layer._label = label;
    }

    // adding labels to layers
    this._addLabelsToLayers(additionalLabelLayer || labelsLayer, label);
  },

  _createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, pane) {
    let leafletMap = this.get('leafletMap');
    let label = L.marker(latlng, {
      icon: L.divIcon({
        className: className,
        html: html,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: anchor
      }),
      zIndexOffset: 1000,
      pane: pane
    });

    if (layer._path) {
      label._path = layer._path;
      label._textNode = layer._textNode;
      label._svg = layer._svg;
      label._svgConteiner = layer._svgConteiner;
    }

    label.style = {
      className: className,
      html: html,
      iconSize: [iconWidth, iconHeight]
    };
    label.feature = layer.feature;
    label.leafletMap = leafletMap;

    return label;
  },

  _addLabelsToLayers(labelsLayer, label) {
    if (labelsLayer && label) {
      labelsLayer.addLayer(label);
    }
  },

  /**
    Set position for point.

    @method _setPositionPoint
    @param {Number} width
  */
  _setPositionPoint(width, height) {
    // значения для маркера по умолчанию
    let left = 12.5;
    let right = 12.5;
    let top = 41;
    let bottom = 0;

    let iconSize = this.get('styleSettings.style.marker.style.iconSize');
    let iconAnchor = this.get('styleSettings.style.marker.style.iconAnchor');
    if (!Ember.isNone(iconAnchor) && iconAnchor.length === 2 && !Ember.isNone(iconSize) && iconSize.length === 2) {
      left = iconAnchor[0] || 0;
      right = (iconSize[0] || 0) - (iconAnchor[0] || 0);
      top = iconAnchor[1] || 0;
      bottom = (iconSize[1] || 0) - (iconAnchor[1] || 0);
    }

    let style;
    let anchor;
    let cssClass;

    switch (this.get('labelSettings.location.locationPoint')) {
      case 'overLeft':
        style = 'text-align: right;';
        anchor = [left + width, top + height];
        cssClass = 'over left';
        break;
      case 'overMiddle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), top + height];
        cssClass = 'over middle';
        break;
      case 'overRight':
        style = 'text-align: left;';
        anchor = [-1 * right, top + height];
        cssClass = 'over right';
        break;
      case 'alongLeft':
        style = 'text-align: right;';
        anchor = [left + width, Math.round((height - (bottom - top)) / 2)];
        cssClass = 'along left';
        break;
      case 'alongMidle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), Math.round((height - (bottom - top)) / 2)];
        cssClass = 'along middle';
        break;
      case 'alongRight':
        style = 'text-align: left;';
        anchor = [-1 * right, Math.round((height - (bottom - top)) / 2)];
        cssClass = 'along right';
        break;
      case 'underLeft':
        style = 'text-align: right;';
        anchor = [left + width, -1 * bottom];
        cssClass = 'under left';
        break;
      case 'underMiddle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), -1 * bottom];
        cssClass = 'under middle';
        break;
      case 'underRight':
        style = 'text-align: left;';
        anchor = [-1 * right, -1 * bottom];
        cssClass = 'under right';
        break;
      default:
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), top + height];
        cssClass = 'over middle';
        break;
    }

    return { style, anchor, cssClass };
  },

  /**
    Get text width for line object.

    @method _getWidthText
    @param {String} text
    @param {String} font
    @param {String} fontSize
    @param {String} fontWeight
    @param {String} fontStyle
    @param {String} textDecoration
  */
  _getWidthText(text, font, fontSize, fontWeight, fontStyle, textDecoration) {
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.height = 'auto';
    div.style.width = 'auto';
    div.style.whiteSpace = 'nowrap';
    div.style.fontFamily = font;
    div.style.fontSize = fontSize + 'px';
    div.style.fontWeight = fontWeight;
    div.style.fontStyle = fontStyle;
    div.style.textDecoration = textDecoration;
    div.innerHTML = text;
    document.body.appendChild(div);

    let clientWidth = div.clientWidth;
    document.body.removeChild(div);

    return clientWidth;
  },

  /**
    Set label for line object

    @method _setLabelLine
    @param {Object} layer
    @param {Object} svg
  */
  _setLabelLine(layer, svg, partline, text) {
    let leafletMap = this.get('leafletMap');
    let latlngArr = layer.getLatLngs();
    if (partline) {
      latlngArr = partline.getLatLngs();
    }

    let rings = [];
    let begCoord;
    let endCoord;
    let lType = (!partline) ? layer.toGeoJSON().geometry.type : partline.toGeoJSON().geometry.type;
    if (lType === 'LineString') {
      begCoord = leafletMap.latLngToLayerPoint(latlngArr[0]);
      endCoord = leafletMap.latLngToLayerPoint(latlngArr[latlngArr.length - 1]);
      for (let i = 0; i < latlngArr.length; i++) {
        rings[i] = leafletMap.latLngToLayerPoint(latlngArr[i]);
      }
    } else {
      begCoord = leafletMap.latLngToLayerPoint(latlngArr[0][0]);
      endCoord = leafletMap.latLngToLayerPoint(latlngArr[0][latlngArr[0].length - 1]);
      for (let i = 0; i < latlngArr[0].length; i++) {
        rings[i] = leafletMap.latLngToLayerPoint(latlngArr[0][i]);
      }
    }

    if (begCoord.x > endCoord.x) {
      rings.reverse();
    }

    // зададим буферную зону вокруг path, чтобы надписи не обрезались
    let buffer = 100;
    let minX = 10000000;
    let minY = 10000000;
    let maxX = 600;
    let maxY = 600;
    let layerPathLength = 0;
    for (let i = 0; i < rings.length; i++) {
      if (rings[i].x < minX) {
        minX = rings[i].x;
      }

      if (rings[i].y < minY) {
        minY = rings[i].y;
      }

      if (i > 0) {
        layerPathLength += Math.sqrt(Math.pow((rings[i].x - rings[i - 1].x), 2) + Math.pow((rings[i].y - rings[i - 1].y), 2));
      }
    }

    let { textLength } = this._getPathAndTextLength(layer, text);

    let d = '';
    let kx = minX - 6;
    let ky = minY - 6;

    for (let i = 0; i < rings.length; i++) {
      d += i === 0 ? 'M' : 'L';

      let x;
      let y;

      // если это последняя точка и нам не хватает длины, то продлим
      if (i === rings.length - 1 && layerPathLength < textLength) {
        // но не будем продлевать больше чем на две длины
        let extraLength = textLength > 3 * layerPathLength ?  2 * layerPathLength : textLength - layerPathLength;
        let newPoint = this._getPoint(rings[i - 1].x, rings[i - 1].y, rings[i].x, rings[i].y, extraLength);
        x = newPoint.x;
        y = newPoint.y;
      } else {
        x = rings[i].x;
        y = rings[i].y;
      }

      x = x - kx + buffer;
      y = y - ky + buffer;

      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      d += x + ' ' + y;
    }

    layer._path.setAttribute('d', d);
    svg.setAttribute('width', maxX + buffer + 'px');
    svg.setAttribute('height', maxY + buffer + 'px');

    // компенсируем сдвиг
    svg.setAttribute('style', 'margin: -' + buffer + 'px 0 0 -' + buffer + 'px');
  },

  _getPoint(x1, y1, x2, y2, length) {
    if (x1 === x2) {
      return { x: x1, y: y2 + (y2 > y1 ? 1 : -1) * length };
    }

    if (y1 === y2) {
      return { x: x2 + (x2 > x1 ? 1 : -1) * length, y: y1 };
    }

    let t = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    let x = (t + length) * ((x2 - x1) / t) + x1;
    let y = (t + length) * ((y2 - y1) / t) + y1;

    return { x,  y };
  },

  _getPathAndTextLength(layer, text) {
    let pathLength = layer._path.getTotalLength();
    let optionsLabel = this.get('labelSettings.options');
    let textLength = this._getWidthText(
      text,
      Ember.get(optionsLabel, 'captionFontFamily'),
      Ember.get(optionsLabel, 'captionFontSize'),
      Ember.get(optionsLabel, 'captionFontWeight'),
      Ember.get(optionsLabel, 'captionFontStyle'),
      Ember.get(optionsLabel, 'captionFontDecoration')
    );

    return { pathLength, textLength };
  },

  /**
    Set align for line object's label

    @method _setAlignForLine
    @param {Object} layer
    @param {Object} svg
  */
  _setAlignForLine(layer, text, align, textNode) {
    let { pathLength, textLength } = this._getPathAndTextLength(layer, text);

    if (align === 'center') {
      textNode.setAttribute('dx', ((pathLength / 2) - (textLength / 2)));
    }

    if (align === 'left') {
      textNode.setAttribute('dx', 0);
    }

    if (align === 'right') {
      textNode.setAttribute('dx', (pathLength - textLength - 8));
    }
  },

  /**
    Add text for line object

    @method _addTextForLine
    @param {Object} layer
    @param {String} text
    @param {Object} options
    @param {String} style
  */
  _addTextForLine(layer, text, options, style, partline) {
    let lsvg = L.svg();
    lsvg._initContainer();
    lsvg._initPath(layer);
    let svg = lsvg._container;

    layer._text = text;

    let defaults = {
      fillColor: 'black',
      align: 'left',
      location: 'over'
    };
    options = L.Util.extend(defaults, options);

    layer._textOptions = options;

    if (!text) {
      if (layer._textNode && layer._textNode.parentNode) {
        svg.removeChild(layer._textNode);
        delete layer._text;
      }

      return;
    }

    let id = 'pathdef-' + L.Util.stamp(layer);
    if (partline) {
      id = 'pathdef-' + L.Util.stamp(partline);
    }

    layer._path.setAttribute('id', id);

    let textNode = L.SVG.create('text');
    let textPath = L.SVG.create('textPath');
    let dy = 0;
    let sizeFont = parseInt(this.get('labelSettings.options.captionFontSize'));
    let _lineLocationSelect = this.get('labelSettings.location.lineLocationSelect');

    if (_lineLocationSelect === 'along') {
      dy = Math.ceil(sizeFont / 4);
    }

    if (_lineLocationSelect === 'under') {
      dy = Math.ceil(sizeFont / 2);
    }

    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
    textNode.setAttribute('fill', options.fillColor);
    textNode.setAttribute('style', style);
    textNode.setAttribute('id', 'text-' + id);
    textNode.setAttribute('dy', dy);
    textNode.setAttribute('alignment-baseline', 'baseline');
    textPath.appendChild(document.createTextNode(text));
    textNode.appendChild(textPath);

    this._setLabelLine(layer, svg, partline, text);
    layer._path.setAttribute('stroke-opacity', 0);
    layer._textNode = textNode;
    svg.firstChild.appendChild(layer._path);
    svg.setAttribute('id', 'svg-' + id);
    svg.appendChild(textNode);
    layer._svg = svg;
    let div = L.DomUtil.create('div');
    div.appendChild(svg);
    layer._svgConteiner = div;

    this._setAlignForLine(layer, text, options.align, textNode);
  },

  /**
    Update position for line object's label

    @method _updatePositionLabelForLine
  */
  _updatePositionLabelForLine() {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    let leafletObject = this.get('_leafletObject');

    let _this = this;

    let additionalLabelLayer = null;
    if (additionalZoomLabel) {
      let zoom =  this.get('leafletMap').getZoom();

      let aLayers = additionalZoomLabel.filter(l => { return (l.minZoom == null || l.minZoom <= zoom) && (l.maxZoom == null || l.maxZoom >= zoom); });

      if (aLayers.length > 0) {
        additionalLabelLayer = aLayers[0];
      }
    }

    if (!Ember.isNone(leafletObject)) {
      if (additionalLabelLayer && this.get('leafletMap').hasLayer(additionalLabelLayer)) {
        leafletObject.eachLayer(function (layer) {
          if (!Ember.isNone(layer._path) && !Ember.isEmpty(layer._text)) {
            if (!Ember.isNone(layer._labelAdditional)) {
              // тут бы по идее тоже не для всех обновлять, а для нужного
              layer._labelAdditional.forEach(zoomLabel => {
                if (zoomLabel instanceof L.FeatureGroup) {
                  zoomLabel.getLayers().forEach((label) => {
                    _this._updateAttributesSvg(layer, label._parentLayer, label._svg, label._path);
                  });
                } else {
                  _this._updateAttributesSvg(layer, null, zoomLabel._svg, zoomLabel._path);
                }
              });

            } else {
              _this._updateAttributesSvg(layer, null, layer._label._svg, layer._label._path);
            }
          }
        });
      } else {
        leafletObject.eachLayer(function (layer) {
          if (layer._label) {
            _this._updateAttributesSvg(layer, null, layer._label._svg, layer._label._path);
          }
        });
      }
    }
  },

  _updateAttributesSvg(layer, partline, svg, path) {
    this._setLabelLine(layer, svg, partline, layer._text);
    let d = layer._path.getAttribute('d');
    path.setAttribute('d', d);

    // здесь с префиксом pathdef-
    let id = path.getAttribute('id');

    if (partline) {
      // здесь без префикса pathdef-
      id = 'pathdef-' + L.Util.stamp(partline);
    }

    Ember.$('path#' + id).attr('d', d);
    Ember.$('svg#svg-' + id).attr('width', svg.getAttribute('width'));
    Ember.$('svg#svg-' + id).attr('height', svg.getAttribute('height'));

    let options = layer._textOptions;
    let text = layer._text;
    let textNode = layer._textNode;

    this._setAlignForLine(layer, text, options.align, textNode);
    Ember.$('text#text-' + id).attr('dx', textNode.getAttribute('dx'));
  },

  _labelsLayer: null,
  additionalZoomLabel: null,

  /**
    Show lables

    @method _showLabels
    @param {Array} layers new layers for add labels
    @param {Object} leafletObject leaflet layer
  */
  _showLabels(layers, leafletObject) {
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    if (!Ember.isNone(labelSettingsString)) {
      let leafletMap = this.get('leafletMap');
      if (!leafletObject) {
        leafletObject = this.get('_leafletObject');
      }

      let additionalZoomLabel = this.get('additionalZoomLabel');
      if (!Ember.isNone(additionalZoomLabel) && Ember.isNone(leafletObject.additionalZoomLabel)) {
        additionalZoomLabel.forEach(zoomLabels => {
          zoomLabels.clearLayers();
        });
      }

      let _labelsLayer = this.get('_labelsLayer');
      if (!Ember.isNone(_labelsLayer) && Ember.isNone(leafletObject._labelsLayer)) {
        _labelsLayer.clearLayers();
      }

      if (Ember.isNone(_labelsLayer)) {
        _labelsLayer = L.featureGroup();
        let minScaleRange = this.get('labelSettings.scaleRange.minScaleRange') || this.get('minZoom');
        let maxScaleRange = this.get('labelSettings.scaleRange.maxScaleRange') || this.get('maxZoom');
        _labelsLayer.minZoom = minScaleRange;
        _labelsLayer.maxZoom = maxScaleRange;
        _labelsLayer.leafletMap = leafletMap;
        _labelsLayer.getContainer = this.get('_getContainerPane').bind(this);
        leafletObject._labelsLayer = _labelsLayer;

        let additionalZoomSettings = this.get('labelSettings.scaleRange.additionalZoom');
        if (additionalZoomSettings) {
          additionalZoomLabel = Ember.A();
          let i = 0;
          additionalZoomSettings.forEach(zoomSettings => {
            try {
              // to switch combine-layer
              let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
              let _paneLabel = 'labelLayer' + i + '_' + this.get('layerModel.id') + layerId;
              const _getContainerPaneLabel = function () {
                let className = 'leaflet-' + _paneLabel + '-pane';
                let container = Ember.$(`.${className}`);
                return container[0];
              };

              let labelsLayer = L.featureGroup();
              labelsLayer.minZoom = zoomSettings.minZoom;
              labelsLayer.maxZoom = zoomSettings.maxZoom;
              labelsLayer.check = zoomSettings.check;
              labelsLayer.leafletMap = leafletMap;
              labelsLayer.getContainer = _getContainerPaneLabel.bind(this);
              labelsLayer._paneLabel = _paneLabel;
              additionalZoomLabel.addObject(labelsLayer);
            } catch (e) {
              console.error(e);
            }

            i++;
          });

          leafletObject.additionalZoomLabel = additionalZoomLabel;
          this.set('additionalZoomLabel', additionalZoomLabel);
        }

        if (this.get('typeGeometry') === 'polyline') {
          leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
        }

        // для showExisting не грузим все надписи сразу. слишком много. поэтому приходится догружать при сдвиге карты, как будто это continueLoading,
        // но т.к. в обычном варианте надписи рисуются в featureprocesscallback, то в данной ситуации придется вызывать добавление надписей самостоятельно
        // и для слоев с дополнительными слоями с надписями тоже придется вызвать руками, потому что по прямой логике из featureprocesscallback они уже вызывались
        if (this.get('showExisting') !== false || additionalZoomLabel) {
          leafletMap.on('moveend', this._showLabelsMovingMap, this);
        }
      } else {
        leafletObject.additionalZoomLabel = additionalZoomLabel;
        leafletObject._labelsLayer = _labelsLayer;
      }

      this._createStringLabel(layers, _labelsLayer, additionalZoomLabel);
      if (Ember.isNone(this.get('_labelsLayer'))) {
        this.set('additionalZoomLabel', additionalZoomLabel);
        this.set('_labelsLayer', _labelsLayer);
        this._checkZoomPane();
      }

      if (this.get('typeGeometry') === 'polyline') {
        this._updatePositionLabelForLine();
      }
    }
  },

  /**
    Adds labels to it's leaflet container.

    @method _addLabelsToLeafletContainer
    @param {Array} layers new layers for add labels
    @param {Object} leafletObject leaflet layer
    @private
  */
  _addLabelsToLeafletContainer(layers, leafletObject) {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    let _labelsLayer = this.get('_labelsLayer');

    // чтобы слой нормально выключался в группе,
    // он должен быть в контейнере группы, а не просто в карте
    let leafletContainer = this.get('leafletContainer');

    if (!leafletObject) {
      leafletObject = this.get('_leafletObject') instanceof L.MarkerClusterGroup ? this.get('_leafletObject._originalVectorLayer') : this.get('_leafletObject');
    }

    let thisPane = this.get('_paneLabel');
    if (thisPane) {
      let leafletMap = this.get('leafletMap');
      if (thisPane && !Ember.isNone(leafletMap)) {
        let pane = leafletMap.getPane(thisPane);
        if (!pane || Ember.isNone(pane)) {
          this._createPane(thisPane);
          this._setLayerZIndex();
        }
      }
    }

    if (Ember.isNone(_labelsLayer)) {
      this._showLabels(layers, leafletObject);
      _labelsLayer = this.get('_labelsLayer');
      leafletContainer.addLayer(_labelsLayer);

      additionalZoomLabel = this.get('additionalZoomLabel');
      if (additionalZoomLabel && additionalZoomLabel.length > 0) {
        this._additionalZoomLabelPane();
        additionalZoomLabel.forEach(zoomLabels => {
          leafletContainer.addLayer(zoomLabels);
        });
      }
    } else if (!leafletContainer.hasLayer(_labelsLayer)) {
      leafletContainer.addLayer(_labelsLayer);
      if (additionalZoomLabel && additionalZoomLabel.length > 0) {
        additionalZoomLabel.forEach(zoomLabels => {
          if (zoomLabels && !leafletContainer.hasLayer(zoomLabels)) {
            leafletContainer.addLayer(zoomLabels);
          }
        });
      }
    } else {
      this._showLabels(layers, leafletObject);
      this._additionalZoomLabelPane();
    }
  },

  /**
    Create pane for additional labels.

    @method _additionalZoomLabelPane
    @private
  */
  _additionalZoomLabelPane() {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    if (additionalZoomLabel) {
      additionalZoomLabel.forEach(zoomLabels => {
        let thisPane = zoomLabels._paneLabel;
        if (thisPane) {
          let leafletMap = this.get('leafletMap');
          if (thisPane && !Ember.isNone(leafletMap)) {
            let pane = leafletMap.getPane(thisPane);
            if (!pane || Ember.isNone(pane)) {
              this._createPane(thisPane);
              this._setLayerZIndex();
            }
          }
        }
      });
    }
  },

  /**
    Sets leaflet layer's visibility.

    @method _setLayerVisibility
    @private
  */
  _setLayerVisibility() {
    if (this.get('visibility')) {
      this._addLayerToLeafletContainer();

      let leafletObject = this.get('_leafletObject');

      // Clustering vector layer contains the leaflet's main context in the "_leafletObject._originalVectorLayer" path
      if (leafletObject instanceof L.MarkerClusterGroup) {
        leafletObject = this.get('_leafletObject._originalVectorLayer');
      }

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
        !Ember.isNone(Ember.get(leafletObject, '_labelsLayer'))) {
        this._addLabelsToLeafletContainer();
        this._checkZoomPane();
        if (this.get('typeGeometry') === 'polyline') {
          this._updatePositionLabelForLine();
        }
      }
    } else {
      this._removeLayerFromLeafletContainer();
      this._removeLabelsFromLeafletContainer();
    }
  },

  /**
    Gets feature properties as plain object.
    this is necessary to get properties from odata-vector-layer feature

    @method _setLayerVisibility
    @private
  */
  _getRegularProperties() {
    if (!this || !Ember.get(this, 'feature') || !Ember.get(this, 'feature.properties')) {
      return null;
    }

    return Ember.get(this, 'feature.properties');
  },

  _getGeometry(layer) {
    let geoJSONLayer = layer.toProjectedGeoJSON(this.get('crs'));
    let type = layer.toGeoJSON().geometry.type;
    let forceMulti = this.get('forceMulti') || false;

    if (forceMulti && (type === 'Polygon' || type === 'LineString')) {
      return [geoJSONLayer.geometry.coordinates];
    } else {
      return geoJSONLayer.geometry.coordinates;
    }
  }
});
