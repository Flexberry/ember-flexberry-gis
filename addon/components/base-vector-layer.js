/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base-layer';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';
import Renderer from '../objects/custom-renderer';
import featureWithAreaIntersect from '../utils/feature-with-area-intersect';

const { assert } = Ember;

/**
  Because z-index leaflet-tile-pane = 200.
  Do more just in case
*/
const begIndex = 300;

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
    @property _pane
    @type String
    @readOnly
  */
  _pane: Ember.computed('layerModel.id', function () {
    return 'vectorLayerPane' + this.get('layerModel.id');
  }),

  /**
    @property _renderer
    @type Object
    @readOnly
  */
  _renderer: Ember.computed('_pane', function () {
    let pane = this.get('_pane');
    return new Renderer({ pane: pane });
  }),

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerZIndex: function() {
    let thisPane = this.get('_pane');
    let leafletMap = this.get('leafletMap');
    if (thisPane && !Ember.isNone(leafletMap)) {
      let pane = leafletMap.getPane(thisPane);
      if (pane) {
        pane.style.zIndex = this.get('index') + begIndex;
      }
    }
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
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);
    }
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      // Detach custom event-handler.
      leafletMap.off('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);
    }
  },
});
