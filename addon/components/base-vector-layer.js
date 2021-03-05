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
    @property _pane
    @type String
    @readOnly
  */
  _pane: Ember.computed('layerModel.id', function () {
    return 'vectorLayer' + this.get('layerModel.id');
  }),

  /**
    @property _paneLabel
    @type String
    @readOnly
  */
  _paneLabel: Ember.computed('layerModel.id', 'labelSettings.signMapObjects', function () {
    if (this.get('labelSettings.signMapObjects')) {
      return 'labelLayer' + this.get('layerModel.id');
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
        pane.style.zIndex = this.get('index') + begIndex + 1; //to make the label layer higher than the vector layer
      }
    }
  },

  _setFeaturesProcessCallback() {
    let leafletObject = this.get('_leafletObject');
    leafletObject.on('load', (loaded) => {
      let promise = this._featuresProcessCallback(loaded.layers);
      if (loaded.results && Ember.isArray(loaded.results)) {
        loaded.results.push(promise);
      }
    });
  },

  _featuresProcessCallback(layers) {
    return new Ember.RSVP.Promise((resolve) => {
      let leafletObject = this.get('_leafletObject');

      if (!layers) {
        resolve();
        return;
      }

      let featuresProcessCallback = Ember.get(leafletObject, 'featuresProcessCallback');
      let p = typeof featuresProcessCallback === 'function' ? featuresProcessCallback(layers) : Ember.RSVP.resolve();
      p.then(() => {
        this._addLayersOnMap(layers);

        if (this.get('labelSettings.signMapObjects')) {
          this._addLabelsToLeafletContainer(layers);
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
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    return this._super(...arguments).then((attribitesOptions) => {
      let leafletObject = Ember.get(attribitesOptions, 'object');

      // Return original vector layer for 'flexberry-layers-attributes-panel' component instead of marker cluster group.
      if (leafletObject instanceof L.MarkerClusterGroup) {
        Ember.set(attribitesOptions, 'object', leafletObject._originalVectorLayer);
      }

      Ember.set(attribitesOptions, 'settings.styleSettings', this.get('styleSettings'));

      return attribitesOptions;
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
          vectorLayer.readFormat = this.createReadFormat(vectorLayer);
        }

        vectorLayer.minZoom = this.get('minZoom');
        vectorLayer.maxZoom = this.get('maxZoom');

        vectorLayer.getContainer = this.get('_getContainer').bind(this);

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
        leafletLayer.eachLayer(function (layer) {
          let geoLayer = layer.toGeoJSON();
          let primitive = new Terraformer.Primitive(geoLayer.geometry);

          if (primitiveSatisfiesBounds(primitive, bounds)) {
            let feature;
            if (geoLayer.geometry.type === 'GeometryCollection') {
              geoLayer.geometry.geometries.forEach(feat => {
                let geoObj = { type: 'Feature', geometry: feat };
                features.pushObject(featureWithAreaIntersect(e.polygonLayer.toGeoJSON(), geoObj, leafletLayer, mapModel));
              });
            } else {
              features.pushObject(featureWithAreaIntersect(e.polygonLayer.toGeoJSON(), geoLayer, leafletLayer, mapModel));
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

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) && !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
      leafletObject._labelsLayer.eachLayer((layerShape) => {
        if (map.hasLayer(layerShape)) {
          map.removeLayer(layerShape);
        }
      });
      leafletObject._labelsLayer.clearLayers();
    }

    this.set('loadedBounds', null);
    let load = this.continueLoad();

    return load && load instanceof Ember.RSVP.Promise ? load : Ember.RSVP.resolve();
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);
      leafletMap.on('zoomend', this._checkZoomPane, this);
    }
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
    let labelsLayer = this.get('_labelsLayer');
    if (!Ember.isNone(labelsLayer) && !Ember.isNone(minZoom)) {
      labelsLayer.minZoom = minZoom;
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
    let labelsLayer = this.get('_labelsLayer');
    if (!Ember.isNone(labelsLayer) && !Ember.isNone(maxZoom)) {
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
      propName = Ember.$(str).find('propertyname');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      propName = Ember.$(str).find('propertyname');
    }

    if (propName.length === 0) { // if main node
      propName = Ember.$(str + ' propertyname');
    }

    if (propName.length > 0) {
      for (var prop of propName) {
        let property = prop.innerHTML;
        if (prop.localName !== 'propertyname') {
          property = prop.innerText;
        }

        if (property && layer.feature.properties && layer.feature.properties.hasOwnProperty(property)) {
          let label = layer.feature.properties[property];
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
      func = Ember.$(str).find('function');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      func = Ember.$(str).find('function');
    }

    if (func.length === 0) { // if main node
      func = Ember.$(str + ' function');
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
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Object} labelsLayer Labels layer
    @param {Array} layers new layers for add labels
  */
  _createStringLabel(labelsLayer, layers) {
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
      layers.forEach((layer) => {
        let showExisting = this.get('showExisting');
        let intersectBBox = layer.getBounds ? bbox.intersects(layer.getBounds()) : bbox.contains(layer.getLatLng());
        let staticLoad = showExisting !== false && intersectBBox;
        if (!layer._label && (showExisting === false || staticLoad)) {
          let label = layer.labelValue || this._applyFunction(this._applyProperty(labelSettingsString, layer));
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
    let lType = layer.toGeoJSON().geometry.type;
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let positionPoint = '';
    let html = '';

    if (lType.indexOf('Polygon') !== -1) {
      let geojsonReader = new jsts.io.GeoJSONReader();
      let objJsts = geojsonReader.read(layer.toGeoJSON().geometry);

      try {
        let centroidJsts = objJsts.isValid() ? objJsts.getInteriorPoint() : objJsts.getCentroid();
        if (!objJsts.isValid()) {
          console.log(layer.toGeoJSON().id);
        }

        let geojsonWriter = new jsts.io.GeoJSONWriter();
        let centroid = geojsonWriter.write(centroidJsts);
        latlng = L.latLng(centroid.coordinates[1], centroid.coordinates[0]);
        html = '<div style="' + style + '">' + text + '</div>';
      }
      catch (e) {
        console.error(e.message + ': ' + layer.toGeoJSON().id);
      }
    }

    if (lType.indexOf('Point') !== -1) {
      latlng = layer.getLatLng();
      positionPoint = this._setPositionPoint(iconWidth);
      html = '<div style="' + style + positionPoint + '">' + text + '</div>';
    }

    if (lType.indexOf('LineString') !== -1) {
      let optionsLabel = this.get('labelSettings.options');
      latlng = L.latLng(layer._bounds._northEast.lat, layer._bounds._southWest.lng);
      let options = {
        fillColor: Ember.get(optionsLabel, 'captionFontColor'),
        align: Ember.get(optionsLabel, 'captionFontAlign')
      };
      this._addTextForLine(layer, text, options, style);
      iconWidth = 12;
      iconHeight = 12;
      html = Ember.$(layer._svgConteiner).html();
    }

    if (!latlng) {
      return;
    }

    let label = L.marker(latlng, {
      icon: L.divIcon({
        className: 'label',
        html: html,
        iconSize: [iconWidth, iconHeight]
      }),
      zIndexOffset: 1000,
      pane: this.get('_paneLabel')
    });
    label.style = {
      className: 'label',
      html: html,
      iconSize: [iconWidth, iconHeight]
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
  _setPositionPoint(width) {
    let stylePoint = '';
    let shiftHor = Math.round(width / 2);
    let shiftVerTop = '-60px;';
    let shiftVerBottom = '30px;';

    switch (this.get('labelSettings.location.locationPoint')) {
      case 'overLeft':
        stylePoint = 'margin-right: ' + shiftHor + 'px; margin-top: ' + shiftVerTop;
        break;
      case 'overMiddle':
        stylePoint = 'margin-top: ' + shiftVerTop;
        break;
      case 'overRight':
        stylePoint = 'margin-left: ' + shiftHor + 'px; margin-top: ' + shiftVerTop;
        break;
      case 'alongLeft':
        stylePoint = 'margin-right: ' + shiftHor + 'px;';
        break;
      case 'alongMidle':
        break;
      case 'alongRight':
        stylePoint = 'margin-left: ' + shiftHor + 'px;';
        break;
      case 'underLeft':
        stylePoint = 'margin-right: ' + shiftHor + 'px; margin-top: ' + shiftVerBottom;
        break;
      case 'underMiddle':
        stylePoint = 'margin-top: ' + shiftVerBottom;
        break;
      case 'underRight':
        stylePoint = 'margin-left: ' + shiftHor + 'px; margin-top: ' + shiftVerBottom;
        break;
      default:
        stylePoint = 'margin-left: ' + shiftHor + 'px; margin-top: ' + shiftVerTop;
        break;
    }

    return stylePoint;
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
    div.style.fontSize = fontSize;
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
  _setLabelLine(layer, svg) {
    let leafletMap = this.get('leafletMap');
    let latlngArr = layer.getLatLngs();
    let rings = [];
    let begCoord;
    let endCoord;
    let lType = layer.toGeoJSON().geometry.type;
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
    let kx = minX - 6;
    let ky = minY - 6;

    for (let i = 0; i < rings.length; i++) {
      d += i === 0 ? 'M' : 'L';
      let x = rings[i].x - kx;
      let y = rings[i].y - ky;
      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      d += x + ' ' + y;
    }

    layer._path.setAttribute('d', d);
    svg.setAttribute('width', maxX + 'px');
    svg.setAttribute('height', maxY + 'px');
  },

  /**
    Set align for line object's label

    @method _setAlignForLine
    @param {Object} layer
    @param {Object} svg
  */
  _setAlignForLine(layer, text, align, textNode) {
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

    this._setLabelLine(layer, svg);
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
    let labelsLayer = this.get('_labelsLayer');
    if (this.get('leafletMap').hasLayer(labelsLayer)) {
      let _this = this;
      let leafletObject = _this.get('_leafletObject');
      if (!Ember.isNone(leafletObject)) {
        leafletObject.eachLayer(function (layer) {
          if (!Ember.isNone(layer._path)) {
            let svg = layer._svg;
            _this._setLabelLine(layer, svg);
            let d = layer._path.getAttribute('d');
            let path = svg.firstChild.firstChild;
            path.setAttribute('d', d);
            let id = path.getAttribute('id');

            Ember.$('path#' + id).attr('d', d);
            Ember.$('svg#svg-' + id).attr('width', svg.getAttribute('width'));
            Ember.$('svg#svg-' + id).attr('height', svg.getAttribute('height'));

            let options = layer._textOptions;
            let text = layer._text;
            let textNode = layer._textNode;

            _this._setAlignForLine(layer, text, options.align, textNode);
            Ember.$('text#text-' + id).attr('dx', textNode.getAttribute('dx'));
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
  */
  _showLabels(layers) {
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    if (!Ember.isNone(labelSettingsString)) {
      let leafletMap = this.get('leafletMap');
      let leafletObject = this.get('_leafletObject');
      let labelsLayer = this.get('_labelsLayer');
      if (!Ember.isNone(labelsLayer) && Ember.isNone(leafletObject._labelsLayer)) {
        labelsLayer.clearLayers();
      }

      if (Ember.isNone(labelsLayer)) {
        labelsLayer = L.featureGroup();
        let minScaleRange = this.get('labelSettings.scaleRange.minScaleRange') || this.get('minZoom');
        let maxScaleRange = this.get('labelSettings.scaleRange.maxScaleRange') || this.get('maxZoom');
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
      if (Ember.isNone(this.get('_labelsLayer'))) {
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
    @private
  */
  _addLabelsToLeafletContainer(layers) {
    let labelsLayer = this.get('_labelsLayer');
    let leafletMap = this.get('leafletMap');

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

    if (Ember.isNone(labelsLayer)) {
      this._showLabels(layers);
      labelsLayer = this.get('_labelsLayer');
      leafletMap.addLayer(labelsLayer);
    } else if (!leafletMap.hasLayer(labelsLayer)) {
      leafletMap.addLayer(labelsLayer);
    } else {
      this._showLabels(layers);
    }
  },

  /**
    Removes labels from it's leaflet container.

    @method _removeLabelsFromLeafletContainer
    @private
  */
  _removeLabelsFromLeafletContainer() {
    let labelsLayer = this.get('_labelsLayer');
    if (Ember.isNone(labelsLayer)) {
      return;
    }

    let leafletMap = this.get('leafletMap');
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
      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) && !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
        this._addLabelsToLeafletContainer();
      }
    } else {
      this._removeLayerFromLeafletContainer();
      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) && !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
        this._removeLabelsFromLeafletContainer();
      }
    }
  }
});
