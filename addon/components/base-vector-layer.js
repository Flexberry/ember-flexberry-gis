/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base-layer';
import { setLeafletLayerOpacity } from '../utils/leaflet-opacity';
import jsts from 'npm:jsts';

const { assert } = Ember;

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

        // add labels
        if (this.get('labelSettings.signMapObjects') && this.get('showExisting') === false) {
          vectorLayer.on('load', (e) => {
            this._addLabelsToLeafletContainer();
          });
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
        leafletLayer.eachLayer(function (layer) {
          let geoLayer = layer.toGeoJSON();
          let primitive = new Terraformer.Primitive(geoLayer.geometry);

          if (primitiveSatisfiesBounds(primitive, bounds)) {
            features.pushObject(geoLayer);
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
      leafletMap.off('flexberry-map:getOrLoadLayerFeatures', this._getOrLoadLayerFeatures, this);
      if (this.get('showExisting') !== false) {
        leafletMap.off('moveend', this._showLabelsMovingMap, this);
      }

      let lType = this.get('_leafletObject').getLayers()[0].toGeoJSON().geometry.type;
      if (lType.indexOf('LineString') !== -1) {
        leafletMap.off('zoomend', this._updatePositionLabelForLine, this);
      }
    }
  },

  _createLayer() {
    this._super(...arguments);

    // add labels
    if (this.get('labelSettings.signMapObjects') && this.get('showExisting') !== false) {
      this.get('_leafletLayerPromise').then((leafletLayer) => {
        this._addLabelsToLeafletContainer();
      });
    }
  },

  /**
    Create array of strings and feature properies.

    @method _parseString
    @param {String} expression String for parsing
  */
  _parseString(expression) {
    if (Ember.isBlank(expression)) {
      return null;
    }

    let exp = expression.trim();
    let reg = /'(.+?)'/g;
    let expResult = exp.split(reg).filter(x => x !== '');
    return expResult ?  expResult : null;
  },

  /**
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Array} expResult Create array of strings and feature properies
    @param {Object} labelsLayer Labels layer
  */
  _createStringLabel(expResult, labelsLayer) {
    let optionsLabel = this.get('labelSettings.options');
    let leafletObject = this.get('_leafletObject');
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
    leafletObject.eachLayer((layer) => {
      let dynamicLoad = this.get('showExisting') === false && this.get('continueLoading');
      let intersectBBox = layer.getBounds ? bbox.intersects(layer.getBounds()) : bbox.contains(layer.getLatLng());
      let staticLoad = this.get('showExisting') !== false && intersectBBox;
      if (!layer._label && (dynamicLoad || staticLoad)) {
        let label = '';
        let isProp = false;
        expResult.forEach(function(element) {
          for (let key in layer.feature.properties) {
            if (key === element && !Ember.isNone(layer.feature.properties[key]) && !Ember.isBlank(layer.feature.properties[key])) {
              label += layer.feature.properties[key];
              isProp = true;
            }
          }

          label += !isProp ?  element : '';
          isProp = false;
        });
        this._createLabel(label, layer, style, labelsLayer);
      }
    });
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
    let ctx = layer._renderer ? layer._renderer._ctx : document.getElementsByTagName('canvas')[0].getContext('2d');
    let widthText = ctx ? ctx.measureText(text).width : 100;
    let iconWidth = widthText;

    let iconHeight = 40;
    let positionPoint = '';
    let html = '';

    if (lType.indexOf('Polygon') !== -1) {
      let geojsonReader = new jsts.io.GeoJSONReader();
      let objJsts = geojsonReader.read(layer.feature.geometry);
      let centroid = objJsts.getCentroid();
      latlng = layer.getBounds().getCenter();
      html = '<p style="' + style + '">' + text + '</p>';
    }

    if (lType.indexOf('Point') !== -1) {
      latlng = layer.getLatLng();
      positionPoint = this._setPositionPoint(iconWidth);
      html = '<p style="' + style + positionPoint + '">' + text + '</p>';
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

    let label = L.marker(latlng, {
      icon: L.divIcon({
        className: 'label',
        html: html,
        iconSize: [iconWidth, iconHeight]
      }),
      zIndexOffset: 1000
    });
    label.style = {
      className: 'label',
      html:html,
      iconSize: [iconWidth, iconHeight]
    };
    labelsLayer.addLayer(label);
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

    switch (this.get('value.location.locationPoint')) {
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
    let dy =  0;
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
    let _this = this;
    let leafletObject = _this.get('_leafletObject');
    if (!Ember.isNone(leafletObject)) {
      leafletObject.eachLayer(function(layer) {
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
  },

  _labelsLayer:null,

  /**
    Show lables

    @method _showLabels
  */
  _showLabels() {
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    let arrLabelString = this._parseString(labelSettingsString);
    if (!Ember.isNone(arrLabelString)) {
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
        leafletObject._labelsLayer = labelsLayer;

        if (this.get('showExisting') !== false) {
          leafletMap.on('moveend', this._showLabelsMovingMap, this);
        }

        let lType = leafletObject.getLayers()[0].toGeoJSON().geometry.type;
        if (lType.indexOf('LineString') !== -1) {
          //this._updatePositionLabelForLine();
          leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
        }
      } else {
        leafletObject._labelsLayer = labelsLayer;
      }

      this._createStringLabel(arrLabelString, labelsLayer);
      this.set('_labelsLayer', labelsLayer);


      //this._addLabelsToLeafletContainer();
      //leafletMap.on('moveend', this._showLabelsMovingMap, this);

      let lType = leafletObject.getLayers()[0].toGeoJSON().geometry.type;

      if (lType.indexOf('LineString') !== -1) {
        this._updatePositionLabelForLine();
        //leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
      }
    }
  },

  /**
    Show labels when map moving

    @method _showLabelsMovingMap
  */
  _showLabelsMovingMap() {
    let labelsLayer = this.get('_labelsLayer');
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    let arrLabelString = this._parseString(labelSettingsString);
    this._addLabelsToLeafletContainer();
  },

  /**
    Adds labels to it's leaflet container.

    @method _addLabelsToLeafletContainer
    @private
  */
  _addLabelsToLeafletContainer() {
    let labelsLayer = this.get('_labelsLayer');

    if (Ember.isNone(labelsLayer)) {
      this._showLabels();
      labelsLayer = this.get('_labelsLayer');
      let leafletMap = this.get('leafletMap');
      leafletMap.addLayer(labelsLayer);
    } else {
      this._showLabels();
    }

    //let leafletMap = this.get('leafletMap');// || this._targetObject.leafletMap;
    //leafletMap.addLayer(labelsLayer);
    /*let lType = this.get('_leafletObject').getLayers()[0].toGeoJSON().geometry.type;

    if (lType.indexOf('LineString') !== -1) {
      this._updatePositionLabelForLine();
    }*/
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
      /*let labelsLayer = this.get('_labelsLayer');
      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_leafletObject'))) {
        if (!Ember.isNone(labelsLayer) && !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
          let leafletMap = this.get('leafletMap');
          leafletMap.addLayer(labelsLayer);
        } else {
          this._addLabelsToLeafletContainer();
        }
      }*/

      
    } else {
      this._removeLayerFromLeafletContainer();
      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) && !Ember.isNone(this.get('_leafletObject._labelsLayer'))) {
        this._removeLabelsFromLeafletContainer();
      }
    }
  },
});
