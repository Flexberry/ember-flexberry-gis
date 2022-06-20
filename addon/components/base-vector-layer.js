/**
  @module ember-flexberry-gis
*/

import { htmlSafe } from '@ember/template';

import { getOwner } from '@ember/application';
import RSVP, { Promise, resolve, hash } from 'rsvp';
import { isArray, A } from '@ember/array';
import { isNone, isEqual } from '@ember/utils';
import $ from 'jquery';
import { once } from '@ember/runloop';
import {
  observer, computed, get, set
} from '@ember/object';
import { assert } from '@ember/debug';
import jsts from 'npm:jsts';
import BaseLayer from './base-layer';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';
import { checkMapZoom } from '../utils/check-zoom';
import featureWithAreaIntersect from '../utils/feature-with-area-intersect';

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
  _clusterizeDidChange: observer('clusterize', function () {
    // Call to Ember.run.once is needed because some of layer's 'dynamicProperties' can be unchenged yet ('clusterize' is dynamic property),
    // but Ember.run.once guarantee that all 'dynamicProperies' will be already chaged before '_resetLayer' will be called.
    once(this, '_resetLayer');
  }),

  /**
    @method _getContainer
    @return HTMLElement
    Returns the HTML element for this layer.
  */
  _getContainer() {
    const className = `leaflet-${this.get('_pane')}-pane`;
    const container = $(`.${className}`);
    return container[0];
  },

  /**
    @method _getContainerPane
    @return HTMLElement
    Returns the HTML element for this label layer.
  */
  _getContainerPane() {
    const className = `leaflet-${this.get('_paneLabel')}-pane`;
    const container = $(`.${className}`);
    return container[0];
  },

  /**
    @property _pane
    @type String
    @readOnly
  */
  _pane: computed('layerModel.id', function () {
    // to switch combine-layer
    const layerId = !isNone(this.get('layerId')) ? this.get('layerId') : '';
    return `vectorLayer${this.get('layerModel.id')}${layerId}`;
  }),

  /**
    @property _paneLabel
    @type String
    @readOnly
  */
  _paneLabel: computed('layerModel.id', 'labelSettings.signMapObjects', function () {
    if (this.get('labelSettings.signMapObjects')) {
      // to switch combine-layer
      const layerId = !isNone(this.get('layerId')) ? this.get('layerId') : '';
      return `labelLayer${this.get('layerModel.id')}${layerId}`;
    }

    return null;
  }),

  /**
    @property _renderer
    @type Object
    @readOnly
  */
  _renderer: computed('_pane', function () {
    const pane = this.get('_pane');
    return L.canvas({ pane, });
  }),

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerZIndex() {
    const thisPane = this.get('_pane');
    const leafletMap = this.get('leafletMap');
    if (thisPane && !isNone(leafletMap)) {
      const pane = leafletMap.getPane(thisPane);
      if (pane) {
        pane.style.zIndex = this.get('index') + begIndex;
      }
    }

    const thisPaneLabel = this.get('_paneLabel');
    if (thisPaneLabel && !isNone(leafletMap)) {
      const pane = leafletMap.getPane(thisPaneLabel);
      if (pane) {
        pane.style.zIndex = this.get('index') + begIndex + 1; // to make the label layer higher than the vector layer
      }
    }
  },

  _setFeaturesProcessCallback(leafletObject) {
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    leafletObject.on('load', (loaded) => {
      const promise = this._featuresProcessCallback(loaded.layers, leafletObject);
      if (loaded.results && isArray(loaded.results)) {
        loaded.results.push(promise);
      }
    });
  },

  _featuresProcessCallback(layers, leafletObject) {
    return new Promise((resolve) => {
      if (!leafletObject) {
        leafletObject = this.get('_leafletObject');
      }

      if (!layers) {
        resolve();
        leafletObject.fire('loadCompleted');
        return;
      }

      const featuresProcessCallback = get(leafletObject, 'featuresProcessCallback');
      if (typeof featuresProcessCallback === 'function') {
        layers.forEach((feature) => {
          feature.layerModel = this.get('layerModel');
        });
      }

      const p = typeof featuresProcessCallback === 'function' ? featuresProcessCallback(layers) : RSVP.resolve();
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
  _addLayersOnMap() {
    this._setLayerState();
  },

  /**
    Sets leaflet layer's opacity.

    @method _setLayerOpacity
    @private
  */
  _setLayerOpacity() {
    const config = getOwner(this).resolveRegistration('config:environment');
    const maxGeomOpacity = Number(config.userSettings.maxGeometryOpacity);
    const maxGeomFillOpacity = Number(config.userSettings.maxGeometryFillOpacity);

    const opacity = this.get('opacity');
    if (isNone(opacity)) {
      return;
    }

    const leafletLayer = this.get('_leafletObject');
    if (isNone(leafletLayer)) {
      return;
    }

    // Some layers-styles hide some of layers with their opacity set to 0, so we don't change such layers opacity here.
    const layersStylesRenderer = this.get('_layersStylesRenderer');
    const styleSettings = this.get('styleSettings');
    const visibleLeafletLayers = isNone(styleSettings)
      ? [leafletLayer]
      : layersStylesRenderer.getVisibleLeafletLayers({ leafletLayer, styleSettings, });

    for (let i = 0, len = visibleLeafletLayers.length; i < len; i++) {
      setLeafletLayerOpacity({
        leafletLayer: visibleLeafletLayers[i], opacity, maxGeomOpacity, maxGeomFillOpacity,
      });
    }
  },

  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    return this._super(...arguments).then(((attribitesOptions) => {
      const leafletObject = get(attribitesOptions, 'object');

      // Return original vector layer for 'flexberry-layers-attributes-panel' component instead of marker cluster group.
      if (leafletObject instanceof L.MarkerClusterGroup) {
        set(attribitesOptions, 'object', leafletObject._originalVectorLayer);
      }

      set(attribitesOptions, 'settings.styleSettings', this.get('styleSettings'));

      return attribitesOptions;
    }));
  },

  /**
    Creates leaflet vector layer related to layer type.

    @method createVectorLayer
    @param {Object} options Layer options.
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|
      <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer() {
    assert('BaseVectorLayer\'s \'createVectorLayer\' should be overridden.');
  },

  /**
    Creates read format for the specified leaflet vector layer.

    @method createReadFormat
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>} Leaflet layer.
    @returns {Object} Read format.
  */
  createReadFormat(vectorLayer) {
    const crs = this.get('crs');
    const geometryField = 'geometry';
    const readFormat = new L.Format.GeoJSON({ crs, geometryField, });

    let layerPropertiesDescription = '';
    const layerClass = getOwner(this).lookup(`layer:${this.get('layerModel.type')}`);
    const layerProperties = layerClass.getLayerProperties(vectorLayer);
    for (let i = 0, len = layerProperties.length; i < len; i++) {
      const layerProperty = layerProperties[i];
      const layerPropertyValue = layerClass.getLayerPropertyValues(vectorLayer, layerProperty, 1)[0];

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

    const describeFeatureTypeResponse = ''
      + '<?xml version="1.0" encoding="UTF-8"?>'
      + '<xsd:schema xmlns:gml="http://www.opengis.net/gml" '
      + 'xmlns:flexberry="http://flexberry.ru" '
      + 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
      + 'elementFormDefault="qualified" '
      + 'targetNamespace="http://flexberry.ru">'
      + '<xsd:import namespace="http://www.opengis.net/gml" schemaLocation="http://flexberry.ru/schemas/gml/3.1.1/base/gml.xsd"/>'
      + '<xsd:complexType name="layerType">'
      + '<xsd:complexContent>'
      + '<xsd:extension base="gml:AbstractFeatureType">'
      + '<xsd:sequence>'
      + `${layerPropertiesDescription}`
      + `<xsd:element maxOccurs="1" minOccurs="0" name="${geometryField}" nillable="true" type="gml:GeometryPropertyType"/>`
      + '</xsd:sequence>'
      + '</xsd:extension>'
      + '</xsd:complexContent>'
      + '</xsd:complexType>'
      + '<xsd:element name="layer" substitutionGroup="gml:_Feature" type="flexberry:layerType"/>'
      + '</xsd:schema>';

    const describeFeatureTypeXml = L.XmlUtil.parseXml(describeFeatureTypeResponse);
    const featureInfo = describeFeatureTypeXml.documentElement;
    readFormat.setFeatureDescription(featureInfo);

    return readFormat;
  },

  /**
    Clusterizes created vector layer if 'clusterize' option is enabled.

    @method createClusterLayer
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>} vectorLayer Vector layer which must be clusterized.
    @return {<a href="https://github.com/Leaflet/Leaflet.markercluster/blob/master/src/MarkerClusterGroup.js">L.MarkerClusterGroup</a>}
      Clusterized vector layer.
  */
  createClusterLayer(vectorLayer) {
    const clusterLayer = L.markerClusterGroup(this.get('clusterOptions'));
    clusterLayer.addLayer(vectorLayer);

    clusterLayer._featureGroup.on('layeradd', this._setLayerOpacity, this);
    clusterLayer._featureGroup.on('layerremove', this._setLayerOpacity, this);

    // Original vector layer is necessary for 'flexberry-layers-attributes-panel' component.
    clusterLayer._originalVectorLayer = vectorLayer;

    return clusterLayer;
  },

  /**
    Destroys clusterized leaflet layer related to layer type.

    @method destroyLayer
  */
  destroyClusterLayer(clusterLayer) {
    clusterLayer._featureGroup.off('layeradd', this._setLayerOpacity, this);
    clusterLayer._featureGroup.off('layerremove', this._setLayerOpacity, this);
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

    const field = get(layer, 'settingsAsObject.pkField');
    return isNone(field) ? 'primarykey' : field;
  },

  /**
    Show all layer objects.
    @method showAllLayerObjects
    @return {Promise}
  */
  showAllLayerObjects() {
    return new Promise((resolve) => {
      const leafletObject = this.get('_leafletObject');
      const map = this.get('leafletMap');
      const layer = this.get('layerModel');

      const { continueLoading, } = leafletObject.options;
      if (!continueLoading) {
        if (!isNone(leafletObject)) {
          leafletObject.eachLayer((layerShape) => {
            if (map.hasLayer(layerShape)) {
              map.removeLayer(layerShape);
            }
          });
          if (!leafletObject.options.showExisting) {
            leafletObject.clearLayers();
          }
        }

        leafletObject.promiseLoadLayer = new Promise((resolve) => {
          const e = {
            featureIds: null,
          };

          leafletObject.loadLayerFeatures(e).then(() => {
            resolve('Features loaded');
          });
        });
      } else {
        leafletObject.showLayerObjects = true;
        leafletObject.statusLoadLayer = true;

        this.continueLoad(leafletObject);
        if (isNone(leafletObject.promiseLoadLayer) || !(leafletObject.promiseLoadLayer instanceof Promise)) {
          leafletObject.promiseLoadLayer = resolve();
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
        const labelLayer = leafletObject._labelsLayer;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !isNone(labelLayer) && !map.hasLayer(labelLayer)) {
          map.addLayer(labelLayer);
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
    const leafletObject = this.get('_leafletObject');
    const map = this.get('leafletMap');
    const layer = this.get('layerModel');

    leafletObject.showLayerObjects = false;

    leafletObject.eachLayer(function (layerShape) {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
      }
    });
    const labelsLayer = leafletObject._labelsLayer;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !isNone(labelsLayer) && map.hasLayer(labelsLayer)) {
      labelsLayer.eachLayer(function (labelLayer) {
        if (map.hasLayer(labelLayer)) {
          map.removeLayer(labelLayer);
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
    return new Promise((resolve, reject) => {
      const leafletObject = this.get('_leafletObject');
      const map = this.get('leafletMap');
      const layer = this.get('layerModel');

      if (visibility) {
        const { continueLoading, } = leafletObject.options;
        if (!continueLoading) {
          leafletObject.promiseLoadLayer = new Promise((resolve) => {
            const e = {
              featureIds: objectIds,
            };

            leafletObject.loadLayerFeatures(e).then(() => {
              resolve('Features loaded');
            });
          });
        } else {
          reject(new Error('Not working to layer with continueLoading'));
        }
      } else {
        leafletObject.promiseLoadLayer = RSVP.resolve();
      }

      leafletObject.promiseLoadLayer.then(() => {
        leafletObject.statusLoadLayer = false;
        leafletObject.promiseLoadLayer = null;
        objectIds.forEach((objectId) => {
          const objects = Object.values(leafletObject._layers).filter((shape) => this.get('mapApi')
            .getFromApi('mapModel')
            ._getLayerFeatureId(layer, shape) === objectId);
          if (objects.length > 0) {
            objects.forEach((obj) => {
              if (visibility) {
                map.addLayer(obj);
              } else {
                map.removeLayer(obj);
              }
            });
          }
        });
        const labelLayer = leafletObject._labelsLayer;
        if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !isNone(labelLayer)) {
          objectIds.forEach((objectId) => {
            const objects = Object.values(labelLayer._layers).filter((shape) => this.get('mapApi')
              .getFromApi('mapModel')
              ._getLayerFeatureId(layer, shape) === objectId);
            if (objects.length > 0) {
              objects.forEach((obj) => {
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
    return new Promise((resolve, reject) => {
      const features = {
        featureIds: null,
      };
      this.getLayerFeatures(features)
        .then((featuresLayer) => {
          if (isArray(featuresLayer) && featuresLayer.length > 0) {
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
    const mapApi = this.get('mapApi').getFromApi('mapModel');
    const layerModel = this.get('layerModel');
    const layerId = layerModel.get('id');
    featuresLayer.forEach((obj) => {
      const leafletLayer = isNone(obj.leafletLayer) ? obj : obj.leafletLayer;
      const id = mapApi._getLayerFeatureId(layerModel, leafletLayer);
      if (layerId === e.layerObjectId && e.featureId === id) {
        return;
      }

      const distance = mapApi._getDistanceBetweenObjects(e.featureLayer, leafletLayer);
      if (isNone(result) || distance < result.distance) {
        result = {
          distance,
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
    @return {<a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|
      <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return new Promise((resolve, reject) => {
      hash({
        vectorLayer: this.createVectorLayer(),
      }).then(({ vectorLayer, }) => {
        // Read format contains 'DescribeFeatureType' metadata and is necessary for 'flexberry-layers-attributes-panel' component.
        const { readFormat, } = vectorLayer;
        if (isNone(readFormat)) {
          // For combine layer
          if (!isNone(this.dynamicProperties) && !isNone(this.dynamicProperties.type)) {
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

        if (isNone(vectorLayer.loadLayerFeatures)) {
          set(vectorLayer, 'loadLayerFeatures', this.loadLayerFeatures.bind(this));
        }

        if (this.get('clusterize')) {
          const clusterLayer = this.createClusterLayer(vectorLayer);
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
    const leafletLayer = this.get('_leafletObject');
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
    const primitiveSatisfiesBounds = (primitive, bounds) => {
      let satisfiesBounds = false;

      if (typeof primitive.forEach === 'function') {
        primitive.forEach(function (nestedGeometry, index) {
          if (satisfiesBounds) {
            return;
          }

          const nestedPrimitive = this.get(index);
          satisfiesBounds = primitiveSatisfiesBounds(nestedPrimitive, bounds);
        });
      } else {
        satisfiesBounds = primitive.within(bounds) || primitive.intersects(bounds);
      }

      return satisfiesBounds;
    };

    return new Promise((resolve, reject) => {
      try {
        const features = A();
        const bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());
        const leafletLayer = this.get('_leafletObject');
        const mapModel = this.get('mapApi').getFromApi('mapModel');
        const scale = this.get('mapApi').getFromApi('precisionScale');
        leafletLayer.eachLayer(function (layer) {
          const geoLayer = layer.toGeoJSON();
          const primitive = new Terraformer.Primitive(geoLayer.geometry);

          if (primitiveSatisfiesBounds(primitive, bounds)) {
            if (geoLayer.geometry.type === 'GeometryCollection') {
              geoLayer.geometry.geometries.forEach((feat) => {
                const geoObj = { type: 'Feature', geometry: feat, };
                features.pushObject(featureWithAreaIntersect(e.polygonLayer.toGeoJSON(), geoObj, leafletLayer, mapModel, scale));
              });
            } else {
              features.pushObject(featureWithAreaIntersect(e.polygonLayer.toGeoJSON(), geoLayer, leafletLayer, mapModel, scale));
            }
          }
        });

        resolve(features);
      } catch (error) {
        reject(error.error || error);
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
    return new Promise((resolve) => {
      const searchSettingsPath = 'layerModel.settingsAsObject.searchSettings';
      const leafletLayer = this.get('_leafletObject');
      const features = A();

      let searchFields = (e.context ? this.get(`${searchSettingsPath}.contextSearchFields`) : this.get(`${searchSettingsPath}.searchFields`)) || A();

      // If single search field provided - transform it into array.
      if (!isArray(searchFields)) {
        searchFields = A([searchFields]);
      }

      leafletLayer.eachLayer((layer) => {
        if (features.length < e.searchOptions.maxResultsCount) {
          const feature = get(layer, 'feature');

          // if layer satisfies search query
          let contains = false;
          searchFields.forEach((field) => {
            if (feature && (feature.properties[field])) {
              contains = contains || feature.properties[field].toLowerCase().includes(e.searchOptions.queryString.toLowerCase());
            }
          });

          if (contains) {
            const foundFeature = layer.toGeoJSON();
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
    return new Promise((resolve) => {
      const { queryFilter, } = e;
      const features = A();
      const equals = [];

      layerLinks.forEach((link) => {
        const linkParameters = link.get('parameters');

        if (isArray(linkParameters) && linkParameters.length > 0) {
          linkParameters.forEach((linkParam) => {
            const property = linkParam.get('layerField');
            const propertyValue = queryFilter[linkParam.get('queryKey')];

            equals.push({ prop: property, value: propertyValue, });
          });
        }
      });

      const leafletLayer = this.get('_leafletObject');
      leafletLayer.eachLayer((layer) => {
        const feature = get(layer, 'feature');
        let meet = true;
        equals.forEach((equal) => {
          meet = meet && isEqual(feature.properties[equal.prop], equal.value);
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
  loadLayerFeatures() {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
      const leafletObject = this.get('_leafletObject');
      const { featureIds, } = e;
      if (isArray(featureIds) && !isNone(featureIds)) {
        const objects = [];
        featureIds.forEach((id) => {
          const features = leafletObject._layers;
          const obj = Object.values(features).find((feature) => this.get('mapApi')
            .getFromApi('mapModel')
            ._getLayerFeatureId(this.get('layerModel'), feature) === id);
          if (!isNone(obj)) {
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
      features: e.load ? this.loadLayerFeatures(e) : this.getLayerFeatures(e),
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
    const shouldContinueLoad = A(e.layers || []).includes(this.get('layerModel'));
    if (!shouldContinueLoad) {
      return;
    }

    // Call public identify method, if layer should be continueLoad.
    e.results.push({
      layerModel: this.get('layerModel'),
      promise: this.continueLoad(this.get('_leafletObject')),
    });
  },

  /*
    Clear changes. Needs for CancelEdit and Reload
  */
  clearChanges() {
  },

  reload() {
    this.clearChanges();

    const leafletObject = this.get('_leafletObject');
    const map = this.get('leafletMap');

    leafletObject.eachLayer((layerShape) => {
      if (map.hasLayer(layerShape)) {
        map.removeLayer(layerShape);
      }
    });
    leafletObject.clearLayers();

    if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
      leafletObject._labelsLayer.eachLayer((layerShape) => {
        if (map.hasLayer(layerShape)) {
          map.removeLayer(layerShape);
        }
      });
      leafletObject._labelsLayer.clearLayers();
    }

    this.set('loadedBounds', null);
    const load = this.continueLoad();

    return load && load instanceof Promise ? load : resolve();
  },

  /**
    Adds a listener function to leafletMap.

    @method onLeafletMapEvent
    @return nothing.
  */
  onLeafletMapEvent() {
    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
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
    const leafletObject = this.get('_leafletObject');
    const thisPane = this.get('_pane');
    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap) && thisPane && !isNone(leafletObject)) {
      const pane = leafletMap.getPane(thisPane);
      const mapPane = leafletMap._mapPane;
      if (!isNone(mapPane) && !isNone(pane)) {
        const existPaneDomElem = $(mapPane).children(`[class*='${thisPane}']`).length;
        if (existPaneDomElem > 0 && !checkMapZoom(leafletObject)) {
          L.DomUtil.remove(pane);
        } else if (existPaneDomElem === 0 && checkMapZoom(leafletObject)) {
          mapPane.appendChild(pane);
        }
      }
    }

    const thisPaneLabel = this.get('_paneLabel');
    if (this.get('labelSettings.signMapObjects') && !isNone(leafletMap) && thisPaneLabel && !isNone(leafletObject)) {
      const pane = leafletMap.getPane(thisPaneLabel);
      const labelsLayer = this.get('_labelsLayer');
      const mapPane = leafletMap._mapPane;
      if (!isNone(mapPane) && !isNone(pane) && !isNone(labelsLayer)) {
        const existPaneDomElem = $(mapPane).children(`[class*='${thisPaneLabel}']`).length;
        if (existPaneDomElem > 0 && !checkMapZoom(labelsLayer)) {
          L.DomUtil.remove(pane);
        } else if (existPaneDomElem === 0 && checkMapZoom(labelsLayer)) {
          mapPane.appendChild(pane);
        }
      }
    }
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      leafletMap.off('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);

      if (this.get('typeGeometry') === 'polyline') {
        leafletMap.off('zoomend', this._updatePositionLabelForLine, this);
      }
    }
  },

  _createLayer() {
    this._super(...arguments);

    this.get('_leafletLayerPromise').then(() => {
      this._checkZoomPane();
    });
  },

  /**
    Switches labels layer's minScaleRange.

    @method _zoomMinDidChange
    @private
  */
  _zoomMinDidChange: observer('labelSettings.scaleRange.minScaleRange', function () {
    const minZoom = this.get('labelSettings.scaleRange.minScaleRange');
    const labelsLayer = this.get('_labelsLayer');
    if (!isNone(labelsLayer) && !isNone(minZoom)) {
      labelsLayer.minZoom = minZoom;
      this._checkZoomPane();
    }
  }),

  /**
    Switches labels layer's maxScaleRange.

    @method _zoomMaxDidChange
    @private
  */
  _zoomMaxDidChange: observer('labelSettings.scaleRange.maxScaleRange', function () {
    const maxZoom = this.get('labelSettings.scaleRange.maxScaleRange');
    const labelsLayer = this.get('_labelsLayer');
    if (!isNone(labelsLayer) && !isNone(maxZoom)) {
      labelsLayer.maxZoom = maxZoom;
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
    try {
      propName = $('<p>' + str + '</p>').find('propertyname');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      propName = $('<p>' + str + '</p>').find('propertyname');
    }

    if (propName.length === 0) { // if main node
      propName = $('<p>' + str + '</p> propertyname');
    }

    if (propName.length > 0) {
      propName.forEach((prop) => {
        let property = prop.innerHTML;
        if (prop.localName !== 'propertyname') {
          property = prop.innerText;
        }

        if (property && layer.feature.properties && Object.prototype.hasOwnProperty.call(layer.feature.properties, property)) {
          let label = layer.feature.properties[property];
          if (isNone(label)) {
            label = '';
          }

          str = str.replace(prop.outerHTML, label);
        }
      });
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    }

    return str;
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
      func = $('<p>' + str + '</p>').find('function');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      func = $('<p>' + str + '</p>').find('function');
    }

    if (func.length === 0) { // if main node
      func = $('<p>' + str + '</p> function');
    }

    if (func.length > 0) {
      func.forEach((item) => {
        let nameFunc = $(item).attr('name');
        if (!isNone(nameFunc)) {
          nameFunc = $(item).attr('name').replaceAll('\\"', '');
          switch (nameFunc) {
            case 'toFixed': {
              const attr = $(item).attr('attr').replaceAll('\\"', '');
              const property = item.innerHTML;
              const numProp = Number.parseFloat(property);
              const numAttr = Number.parseFloat(attr);
              if (!isNone(attr) && !isNone(property) && !Number.isNaN(numProp) && !Number.isNaN(numAttr)) {
                const newStr = numProp.toFixed(numAttr);
                str = str.replace(item.outerHTML, newStr);
              }

              break;
            }
            default:
          }
        }
      });
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    }

    return str;
  },

  /**
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Object} labelsLayer Labels layer
    @param {Array} layers new layers for add labels
  */
  _createStringLabel(labelsLayer, layers) {
    const optionsLabel = this.get('labelSettings.options');
    const labelSettingsString = this.get('labelSettings.labelSettingsString');
    const style = htmlSafe(
      `font-family: ${get(optionsLabel, 'captionFontFamily')}; `
      + `font-size: ${get(optionsLabel, 'captionFontSize')}px; `
      + `font-weight: ${get(optionsLabel, 'captionFontWeight')}; `
      + `font-style: ${get(optionsLabel, 'captionFontStyle')}; `
      + `text-decoration: ${get(optionsLabel, 'captionFontDecoration')}; `
      + `color: ${get(optionsLabel, 'captionFontColor')}; `
      + `text-align: ${get(optionsLabel, 'captionFontAlign')}; `
    );

    const leafletMap = this.get('leafletMap');
    const bbox = leafletMap.getBounds();
    if (layers) {
      layers.forEach((layer) => {
        const showExisting = this.get('showExisting');
        const intersectBBox = layer.getBounds ? bbox.intersects(layer.getBounds()) : bbox.includes(layer.getLatLng());
        const staticLoad = showExisting !== false && intersectBBox;
        if (!layer._label && (showExisting === false || staticLoad)) {
          const label = layer.labelValue || this._applyFunction(this._applyProperty(labelSettingsString, layer));
          this._createLabel(label, layer, style, labelsLayer);
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
  */
  _createLabel(text, layer, style, labelsLayer) {
    const lType = layer.toGeoJSON().geometry.type;
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let anchor = null;
    let className = 'label';
    let html = '';

    if (lType.indexOf('Polygon') !== -1) {
      const geojsonReader = new jsts.io.GeoJSONReader();
      const objJsts = geojsonReader.read(layer.toGeoJSON().geometry);

      try {
        const centroidJsts = objJsts.isValid() ? objJsts.getInteriorPoint() : objJsts.getCentroid();
        const geojsonWriter = new jsts.io.GeoJSONWriter();
        const centroid = geojsonWriter.write(centroidJsts);
        latlng = L.latLng(centroid.coordinates[1], centroid.coordinates[0]);
        html = `<div style="${style}">${text}</div>`;
      } catch (e) {
        console.error(`${e.message}: ${layer.toGeoJSON().id}`);
      }
    }

    if (lType.indexOf('Point') !== -1) {
      latlng = layer.getLatLng();
      iconWidth = 30;
      iconHeight = 30;
      let positionPoint = this._setPositionPoint(iconWidth, iconHeight);
      anchor = positionPoint.anchor;
      className += ' point ' + positionPoint.cssClass;
      html = `<div style="${style}${positionPoint}">${text}</div>`;
    }

    if (lType.indexOf('LineString') !== -1) {
      const optionsLabel = this.get('labelSettings.options');
      latlng = L.latLng(layer._bounds._northEast.lat, layer._bounds._southWest.lng);
      const options = {
        fillColor: get(optionsLabel, 'captionFontColor'),
        align: get(optionsLabel, 'captionFontAlign'),
      };
      this._addTextForLine(layer, text, options, style);
      iconWidth = 12;
      iconHeight = 12;
      html = $(layer._svgConteiner).html();
    }

    if (!latlng) {
      return;
    }

    const label = L.marker(latlng, {
      icon: L.divIcon({
        className,
        html,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: anchor,
      }),
      zIndexOffset: 1000,
      pane: this.get('_paneLabel'),
    });
    label.style = {
      className,
      html,
      iconSize: [iconWidth, iconHeight],
    };
    labelsLayer.addLayer(label);
    label.feature = layer.feature;
    label.leafletMap = labelsLayer.leafletMap;
    layer._label = label;
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
    if (!isNone(iconAnchor) && iconAnchor.length === 2 && !isNone(iconSize) && iconSize.length === 2) {
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
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.height = 'auto';
    div.style.width = 'auto';
    div.style.whiteSpace = 'nowrap';
    div.style.fontFamily = font;
    div.style.fontSize = fontSize;
    div.style.fontWeight = fontWeight;
    div.style.fontStyle = fontStyle;
    div.style.textDecoration = textDecoration;
    div.innerHTML = text;
    document.body.appendChild(div);

    const { clientWidth, } = div;
    document.body.removeChild(div);

    return clientWidth;
  },

  /**
    Set label for line object

    @method _setLabelLine
    @param {Object} layer
    @param {Object} svg
  */
  _setLabelLine(layer, svg) {
    const leafletMap = this.get('leafletMap');
    const latlngArr = layer.getLatLngs();
    const rings = [];
    let begCoord;
    let endCoord;
    const lType = layer.toGeoJSON().geometry.type;
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

    let minX = 10000000;
    let minY = 10000000;
    let maxX = 600;
    let maxY = 600;
    for (let i = 0; i < rings.length; i++) {
      if (rings[i].x < minX) {
        minX = rings[i].x;
      }

      if (rings[i].y < minY) {
        minY = rings[i].y;
      }
    }

    let d = '';
    const kx = minX - 6;
    const ky = minY - 6;

    for (let i = 0; i < rings.length; i++) {
      d += i === 0 ? 'M' : 'L';
      const x = rings[i].x - kx;
      const y = rings[i].y - ky;
      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      d += `${x} ${y}`;
    }

    layer._path.setAttribute('d', d);
    svg.setAttribute('width', `${maxX}px`);
    svg.setAttribute('height', `${maxY}px`);
  },

  /**
    Set align for line object's label

    @method _setAlignForLine
    @param {Object} layer
    @param {Object} svg
  */
  _setAlignForLine(layer, text, align, textNode) {
    const pathLength = layer._path.getTotalLength();
    const optionsLabel = this.get('labelSettings.options');
    const textLength = this._getWidthText(
      text,
      get(optionsLabel, 'captionFontFamily'),
      get(optionsLabel, 'captionFontSize'),
      get(optionsLabel, 'captionFontWeight'),
      get(optionsLabel, 'captionFontStyle'),
      get(optionsLabel, 'captionFontDecoration')
    );

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
  _addTextForLine(layer, text, options, style) {
    const lsvg = L.svg();
    lsvg._initContainer();
    lsvg._initPath(layer);
    const svg = lsvg._container;

    layer._text = text;

    const defaults = {
      fillColor: 'black',
      align: 'left',
      location: 'over',
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

    const id = `pathdef-${L.Util.stamp(layer)}`;
    layer._path.setAttribute('id', id);

    const textNode = L.SVG.create('text');
    const textPath = L.SVG.create('textPath');
    let dy = 0;
    const sizeFont = parseInt(this.get('labelSettings.options.captionFontSize'), 10);
    const _lineLocationSelect = this.get('labelSettings.location.lineLocationSelect');

    if (_lineLocationSelect === 'along') {
      dy = Math.ceil(sizeFont / 4);
    }

    if (_lineLocationSelect === 'under') {
      dy = Math.ceil(sizeFont / 2);
    }

    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${id}`);
    textNode.setAttribute('fill', options.fillColor);
    textNode.setAttribute('style', style);
    textNode.setAttribute('id', `text-${id}`);
    textNode.setAttribute('dy', dy);
    textNode.setAttribute('alignment-baseline', 'baseline');
    textPath.appendChild(document.createTextNode(text));
    textNode.appendChild(textPath);

    this._setLabelLine(layer, svg);
    layer._path.setAttribute('stroke-opacity', 0);
    layer._textNode = textNode;
    svg.firstChild.appendChild(layer._path);
    svg.setAttribute('id', `svg-${id}`);
    svg.appendChild(textNode);
    layer._svg = svg;
    const div = L.DomUtil.create('div');
    div.appendChild(svg);
    layer._svgConteiner = div;

    this._setAlignForLine(layer, text, options.align, textNode);
  },

  /**
    Update position for line object's label

    @method _updatePositionLabelForLine
  */
  _updatePositionLabelForLine() {
    const labelsLayer = this.get('_labelsLayer');
    if (this.get('leafletMap').hasLayer(labelsLayer)) {
      const _this = this;
      const leafletObject = _this.get('_leafletObject');
      if (!isNone(leafletObject)) {
        leafletObject.eachLayer(function (layer) {
          if (!isNone(layer._path)) {
            const svg = layer._svg;
            _this._setLabelLine(layer, svg);
            const d = layer._path.getAttribute('d');
            const path = svg.firstChild.firstChild;
            path.setAttribute('d', d);
            const id = path.getAttribute('id');

            $(`path#${id}`).attr('d', d);
            $(`svg#svg-${id}`).attr('width', svg.getAttribute('width'));
            $(`svg#svg-${id}`).attr('height', svg.getAttribute('height'));

            const options = layer._textOptions;
            const text = layer._text;
            const textNode = layer._textNode;

            _this._setAlignForLine(layer, text, options.align, textNode);
            $(`text#text-${id}`).attr('dx', textNode.getAttribute('dx'));
          }
        });
      }
    }
  },

  _labelsLayer: null,

  /**
    Show lables

    @method _showLabels
    @param {Array} layers new layers for add labels
    @param {Object} leafletObject leaflet layer
  */
  _showLabels(layers, leafletObject) {
    const labelSettingsString = this.get('labelSettings.labelSettingsString');
    if (!isNone(labelSettingsString)) {
      const leafletMap = this.get('leafletMap');
      if (!leafletObject) {
        leafletObject = this.get('_leafletObject');
      }

      let labelsLayer = this.get('_labelsLayer');
      if (!isNone(labelsLayer) && isNone(leafletObject._labelsLayer)) {
        labelsLayer.clearLayers();
      }

      if (isNone(labelsLayer)) {
        labelsLayer = L.featureGroup();
        const minScaleRange = this.get('labelSettings.scaleRange.minScaleRange') || this.get('minZoom');
        const maxScaleRange = this.get('labelSettings.scaleRange.maxScaleRange') || this.get('maxZoom');
        labelsLayer.minZoom = minScaleRange;
        labelsLayer.maxZoom = maxScaleRange;
        labelsLayer.leafletMap = leafletMap;
        labelsLayer.getContainer = this.get('_getContainerPane').bind(this);
        leafletObject._labelsLayer = labelsLayer;

        if (this.get('typeGeometry') === 'polyline') {
          leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
        }
      } else {
        leafletObject._labelsLayer = labelsLayer;
      }

      this._createStringLabel(labelsLayer, layers);
      if (isNone(this.get('_labelsLayer'))) {
        this.set('_labelsLayer', labelsLayer);
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
    let labelsLayer = this.get('_labelsLayer');
    let leafletMap = this.get('leafletMap');
    if (!leafletObject) {
      leafletObject = this.get('_leafletObject');
    }

    const thisPane = this.get('_paneLabel');
    if (thisPane) {
      leafletMap = this.get('leafletMap');
      if (thisPane && !isNone(leafletMap)) {
        const pane = leafletMap.getPane(thisPane);
        if (!pane || isNone(pane)) {
          this._createPane(thisPane);
          this._setLayerZIndex();
        }
      }
    }

    if (isNone(labelsLayer)) {
      this._showLabels(layers, leafletObject);
      labelsLayer = this.get('_labelsLayer');
      leafletMap.addLayer(labelsLayer);
    } else if (!leafletMap.hasLayer(labelsLayer)) {
      leafletMap.addLayer(labelsLayer);
    } else {
      this._showLabels(layers, leafletObject);
    }
  },

  /**
    Removes labels from it's leaflet container.

    @method _removeLabelsFromLeafletContainer
    @private
  */
  _removeLabelsFromLeafletContainer() {
    const labelsLayer = this.get('_labelsLayer');
    if (isNone(labelsLayer)) {
      return;
    }

    const leafletMap = this.get('leafletMap');
    leafletMap.removeLayer(labelsLayer);
  },

  /**
    Sets leaflet layer's visibility.

    @method _setLayerVisibility
    @private
  */
  _setLayerVisibility() {
    if (this.get('visibility')) {
      this._addLayerToLeafletContainer();
      if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
        this._addLabelsToLeafletContainer();
      }
    } else {
      this._removeLayerFromLeafletContainer();
      if (this.get('labelSettings.signMapObjects') && !isNone(this.get('_labelsLayer')) && !isNone(this.get('_leafletObject._labelsLayer'))) {
        this._removeLabelsFromLeafletContainer();
      }
    }
  },

  _getGeometry(layer) {
    const geoJSONLayer = layer.toProjectedGeoJSON(this.get('crs'));
    const { type, } = layer.toGeoJSON().geometry;
    const forceMulti = this.get('forceMulti') || false;

    if (forceMulti && (type === 'Polygon' || type === 'LineString')) {
      return [geoJSONLayer.geometry.coordinates];
    }

    return geoJSONLayer.geometry.coordinates;
  },
});
