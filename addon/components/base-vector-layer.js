/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base-layer';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';
import { checkMapZoom, checkMapZoomStyle } from '../utils/check-zoom';
import layerLabel from '../mixins/layer-label';
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
export default BaseLayer.extend(layerLabel, {
  i18n: Ember.inject.service(),
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
    Returns leaflet layer.

    @method returnLeafletObject
    @returns leafletObject
  */
  returnLeafletObject() {
    let leafletObject = this.get('_leafletObject');

    if (Ember.isNone(leafletObject)) {
      return;
    }

    // Clustering vector layer contains the wfsLayer context in the "_leafletObject._originalVectorLayer" path
    // The context of the original vector layer is important for map handlers, methods instead of cluster group
    if (leafletObject instanceof L.MarkerClusterGroup) {
      let originalVectorLayer = Ember.get(leafletObject, '_originalVectorLayer');
      leafletObject = originalVectorLayer ? originalVectorLayer : leafletObject;
    }

    return leafletObject;
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

    this._setLayerLabelZIndex(begIndex);
  },

  _setFeaturesProcessCallback(leafletObject) {
    if (!leafletObject) {
      leafletObject = this.returnLeafletObject();
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
        leafletObject = this.returnLeafletObject();
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

          // Sometimes featuresProcessCallBack is triggered returning 0 features
          // Then adds labels of layer features that is inside a cluster,
          // It is necessary to clean up the labels with the cluster layer handler
          // that works only for _originalVectorLayer feature addition
          if (this.get('_leafletObject') instanceof L.MarkerClusterGroup) {
            this.loadClusterLayer({ type:'layeradd', target: this.returnLeafletObject(), layer: {} });
          }
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
      this._setLayerStyle();
    }

    if (layerLabel) {
      if (e.type === 'layeradd') {
        layerLabel.forEach(label => {
          if (!leafletMap.hasLayer(label)) {
            leafletMap.addLayer(label);
          }
        });
      } else {
        layerLabel.forEach(label => {
          if (leafletMap.hasLayer(label)) {
            leafletMap.removeLayer(label);
          }
        });
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
    if (!(clusterLayer instanceof L.MarkerClusterGroup)) {
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
        .filter(markerLayer => {
          return markerLayer._label.some(label => {
            return leafletMap.hasLayer(label);
          });
        })
        .map(markerLayerWithLabel => {
          markerLayerWithLabel._label.forEach(label => {
            leafletMap.removeLayer(label);
          });
        });
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
      let leafletObject = this.returnLeafletObject();
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

        this.showAllLayerObjectsLabel(leafletObject, layer);

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
    let leafletObject = this.returnLeafletObject();
    let map = this.get('leafletMap');
    let layer = this.get('layerModel');

    leafletObject.showLayerObjects = false;

    leafletObject.eachLayer(function (layerShape) {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
      }
    });

    this.hideAllLayerObjectsLabel(leafletObject, layer);
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
      let leafletObject = this.returnLeafletObject();
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

        this._setVisibilityObjectsLabel(leafletObject, layer, objectIds, visibility);

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

        // change style by change zoom
        let styleRules = this.get('layerModel.settingsAsObject.styleRules');
        if (styleRules && styleRules.length > 0) {
          this.set('styleRules', styleRules);
          this.set('layerModel.styleRules', styleRules);
          this._updateStyleRules();
          this.get('leafletMap').on('zoomend', this._updateStyleRules, this);
        }

        // load images for style
        let imagePromises = Ember.A();
        let styleSettings = this.get('layerModel.settingsAsObject.styleSettings');
        if (!Ember.isNone(styleRules) && styleRules.length > 0) {
          this._imageFromStyleRules(imagePromises);
        } else if (!Ember.isNone(styleSettings)) {
          this._imageFromStyleSettings(imagePromises, styleSettings);
        }

        if (Ember.isNone(vectorLayer.loadLayerFeatures)) {
          Ember.set(vectorLayer, 'loadLayerFeatures', this.loadLayerFeatures.bind(this));
        }

        let resultLayer = vectorLayer;
        if (this.get('clusterize')) {
          let clusterLayer = this.createClusterLayer(vectorLayer);
          resultLayer = clusterLayer;
        }

        if (imagePromises.length > 0) {
          Ember.RSVP.allSettled(imagePromises).then((styles) => {
            styles.forEach(style => {
              for (let property in style.value) {
                if (!Ember.isNone(style.value[property].tagName)) {
                  styleSettings.style.path[property].imagePattern = style.value[property];
                } else {
                  for (let propertyInner in style.value[property]) {
                    styleRules[property].styleSettings.style.path[propertyInner].imagePattern = style.value[property][propertyInner];
                  }
                }
              }
            });
            resolve(resultLayer);
          });
        } else {
          resolve(resultLayer);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Add in array promise which load pattern from styleSettings.

    @method _imageFromStyleSettings
  */
  _imageFromStyleSettings(imagePromises, styleSettings, index) {
    if (styleSettings.style.path) {
      if (Ember.isArray(styleSettings.style.path)) {
        styleSettings.style.path.forEach((style, i) => {
          if (style.fillStyle === 'pattern') {
            imagePromises.addObject(this._setPattern(style, i, index));
          }
        });
      } else if (styleSettings.style.path.fillStyle === 'pattern') {
        imagePromises.addObject(this._setPattern(styleSettings.style.path, 0, index));
      }
    }
  },

  /**
    For each styleRules load pattern.

    @method _imageFromStyleRules
  */
  _imageFromStyleRules(imagePromises) {
    let styleRules = this.get('styleRules');
    if (Ember.isNone(styleRules)) {
      return;
    }

    styleRules.forEach((styleRule, i) => {
      this._imageFromStyleSettings(imagePromises, styleRule.styleSettings, i);
    });
  },

  /**
    Change styleSettings depending on the zoom.

    @method _updateStyleRules
  */
  _updateStyleRules() {
    let styleRules = this.get('styleRules');
    if (Ember.isNone(styleRules)) {
      return;
    }

    let leafletMap = this.get('leafletMap');
    styleRules.forEach(styleRule => {
      let rule = styleRule.rule;
      let caption = `${this.get('i18n').t('components.base-vector-layer.zoomFrom').string} ${rule.minZoom}
        ${this.get('i18n').t('components.base-vector-layer.zoomTo').string} ${rule.maxZoom}`;
      Ember.set(rule, 'caption', caption);
      if (checkMapZoomStyle(leafletMap, styleRule.rule) && this.get('styleSettings') !== styleRule.styleSettings) {
        this.set('styleSettings', styleRule.styleSettings);
      }
    });
  },

  /**
    Load image for pattern.

    @method _setPattern
  */
  _setPattern(style, i, index = null) {
    return new Ember.RSVP.Promise((resolve) => {
      let image = new Image();
      Ember.set(style, 'pattern', true);
      image.onload = function() {
        Ember.set(style, 'imagePattern', this);
        let result = {};
        if (Ember.isNone(index)) {
          result[i] = this;
        } else {
          let inner = {};
          inner[i] = this;
          result[index] = inner;
        }

        return resolve(result);
      };

      image.src = style.fillPattern;
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
        let leafletLayer = this.returnLeafletObject();
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
      let leafletLayer = this.returnLeafletObject();
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

      let leafletLayer = this.returnLeafletObject();
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
      resolve(this.returnLeafletObject());
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
      let leafletObject = this.returnLeafletObject();
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
      leafletObject: this.returnLeafletObject(),
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
      promise: this.continueLoad(this.returnLeafletObject())
    });
  },

  /*
    Clear changes. Needs for CancelEdit and Reload
  */
  clearChanges() {
  },

  reload() {
    this.clearChanges();

    let leafletObject = this.returnLeafletObject();
    let map = this.get('leafletMap');

    leafletObject.eachLayer((layerShape) => {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
      }
    });
    leafletObject.clearLayers();

    this.reloadLabel(leafletObject);

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
    let leafletObject = this.returnLeafletObject();
    let thisPane = this.get('_pane');
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap) && thisPane && !Ember.isNone(leafletObject)) {
      let pane = leafletMap.getPane(thisPane);
      let mapPane = leafletMap._mapPane;
      if (!Ember.isNone(mapPane) && !Ember.isNone(pane)) {

        let styleRules = this.get('styleRules');
        let styleZoom = Ember.A();
        if (!Ember.isNone(styleRules) && styleRules.length > 0) {
          styleZoom = styleRules.filter(styleRule => {
            return checkMapZoomStyle(leafletMap, styleRule.rule);
          });
        } else {
          if (checkMapZoom(leafletObject)) {
            styleZoom.addObject({});
          }
        }

        let existPaneDomElem = Ember.$(mapPane).children(`[class*='${thisPane}']`).length;
        if (existPaneDomElem > 0 && styleZoom.length === 0) {
          L.DomUtil.remove(pane);
        } else if (existPaneDomElem === 0 && styleZoom.length > 0) {
          mapPane.appendChild(pane);
        }
      }
    }

    this._checkZoomPaneLabel(leafletObject);
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

      let styleRules = this.get('layerModel.settingsAsObject.styleRules');
      if (styleRules.length > 0) {
        leafletMap.off('zoomend', this._updateStyleRules, this);
      }

      this.willDestroyElementLabel(leafletMap);
    }
  },

  _createLayer() {
    this._super(...arguments);

    this.get('_leafletLayerPromise').then((leafletLayer) => {
      this._checkZoomPane();
    });
  },

  /**
    Sets leaflet layer's visibility.

    @method _setLayerVisibility
    @private
  */
  _setLayerVisibility() {
    if (this.get('visibility')) {
      this._addLayerToLeafletContainer();
      if (this.typeGeometry === 'marker' && !this.clusterize) {
        this._setLayerStyle();
      }

      let leafletObject = this.returnLeafletObject();
      this._setLayerVisibilityLabel(leafletObject);
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
  },

  _boundsCrs(leafletObject) {
    let leafletMap = this.get('leafletMap');
    let boundsMap = leafletMap.getBounds();
    if (boundsMap && leafletObject.options && leafletObject.options.crs && leafletObject.options.crs.bounds) {
      let crsBounds = leafletObject.options.crs.bounds;
      if (boundsMap._northEast.lat > crsBounds.max.x) {
        boundsMap._northEast.lat = crsBounds.max.x;
      }

      if (boundsMap._northEast.lng > crsBounds.max.y) {
        boundsMap._northEast.lng = crsBounds.max.y;
      }

      if ((boundsMap._southWest.lat < 0 && boundsMap._southWest.lat < crsBounds.min.x) ||
        (boundsMap._southWest.lat > 0 && boundsMap._southWest.lat > crsBounds.min.x)) {
        boundsMap._southWest.lat = crsBounds.min.x;
      }

      if ((boundsMap._southWest.lng < 0 && boundsMap._southWest.lng < crsBounds.min.y) ||
        (boundsMap._southWest.lng > 0 && boundsMap._southWest.lng > crsBounds.min.y)) {
        boundsMap._southWest.lng = crsBounds.min.y;
      }
    }

    return boundsMap;
  }
});
