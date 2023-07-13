import Ember from 'ember';
import layout from '../templates/components/compare-object-geometries-panel';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import jsts from 'npm:jsts';
import { coordinatesToString } from '../utils/coordinates-to';

export default Ember.Component.extend(LeafletZoomToFeatureMixin, {
  layout,

  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
    */
  mapApi: Ember.inject.service(),

  isActive: false,

  /**
    Objects to compare.
    @property twoObjects
    @type Array
    @default null
  */
  twoObjects: null,

  /**
    Distance.
    @property distanceBetween
    @type Number
    @default null
  */
  distanceBetween: null,

  /**
    Intersection result.
    @property intersection
    @type Feature
    @default null
  */
  intersection: null,

  /**
    Difference result.
    @property intersection
    @type Feature
    @default null
  */
  nonIntersection: null,

  /**
    Observer for twoObjects property.

    @property  _onTwoObjectsChange
    @private
    @readonly
  */
  _onTwoObjectsChange: Ember.observer('twoObjects.[]', 'isActive', function () {
    let two = this.get('twoObjects');

    if (!this.get('isActive') || two.length !== 2) {
      this.set('firstObject', null);
      this.set('secondObject', null);
      this.set('distanceBetween', 0);
      this.set('intersection', 0);
      this.set('nonIntersection', 0);

      return;
    }

    if (two.length === 2) {
      // корректные данные в метрах только в 3857
      let crsCode = this.get('crsCode');

      let mapModel = this.get('mapApi').getFromApi('mapModel');
      let firstObjectCrs = two[0].layerModel.get('_leafletObject.options.crs');
      let secondObjectCrs = two[1].layerModel.get('_leafletObject.options.crs');

      let firstObject = mapModel._convertObjectCoordinates(firstObjectCrs.code, this._getObjectCopy(two[0]), crsCode);
      let secondObject = mapModel._convertObjectCoordinates(secondObjectCrs.code, this._getObjectCopy(two[1]), crsCode);

      let geojsonReader = new jsts.io.GeoJSONReader();
      let firstObjectJstsGeom = geojsonReader.read(firstObject.geometry);
      let secondObjectJstsGeom = geojsonReader.read(secondObject.geometry);
      Ember.set(firstObject, 'area', firstObjectJstsGeom.getArea().toFixed(3));
      Ember.set(secondObject, 'area', secondObjectJstsGeom.getArea().toFixed(3));

      this.set('firstObject', firstObject);
      this.set('secondObject', secondObject);
      this.set('distanceBetween', firstObjectJstsGeom.getCentroid().distance(secondObjectJstsGeom.getCentroid()).toFixed(3));
      this.set('intersection', this.getIntersection(firstObjectJstsGeom, secondObjectJstsGeom));
      this.set('nonIntersection', this.getNonIntersection(firstObjectJstsGeom, secondObjectJstsGeom));
    }
  }),

  _getObjectCopy(source) {
    // чтобы преобразования не портили исходный объект
    return new Object({
      type: source.type,
      displayValue: source.displayValue,
      leafletLayer: source.leafletLayer,
      geometry: Object.assign({}, source.geometry)
    });
  },

  /**
    First object to compare.

    @property firstObject
    @type Feature
    @default null
  */
  firstObject: null,

  /**
    First object's value to display.

    @property firstObjectDisplayValue
    @type String
    @default undefined
  */
  firstObjectDisplayValue: Ember.computed('firstObject.displayValue', function () {
    let displayValue = this.get('firstObject.displayValue');
    let i18n = this.get('i18n');
    return displayValue ? displayValue : i18n.t('components.compare-object-geometries.first-object-display-value');
  }),

  /**
    Second object to compare.

    @property secondObject
    @type Feature
    @default null
  */
  secondObject: null,

  /**
    Second object's value to display.

    @property secondObjectDisplayValue
    @type String
    @default undefined
  */
  secondObjectDisplayValue: Ember.computed('secondObject.displayValue', function () {
    let displayValue = this.get('secondObject.displayValue');
    let i18n = this.get('i18n');
    return displayValue ? displayValue : i18n.t('components.compare-object-geometries.second-object-display-value');
  }),

  /**
     Leaflet map object for zoom and pan.

    @property leafletMap
    @type L.Map
    @default null
  */
  leafletMap: null,

  /**
     Flag indicates if panel is folded.

    @property folded
    @type Boolean
    @default false
  */
  folded: false,

  /**
    Layer contains non/intersection features.

    @property featuresLayer
    @type Object
    @default null
  */
  featuresLayer: null,

  /**
    Service layer.

    @property serviceLayer
    @type Object
    @default null
  */
  serviceLayer: null,

  /**
    Area and distance in meters only with crs=3857
  */
  crsCode: 'EPSG:3857',

  /**
    Observer for leafletMap property adding layer with results.

    @property _OnMapChanged
    @private
    @readonly
  */
  _OnMapChanged: Ember.observer('leafletMap', function () {
    let map = this.get('leafletMap');
    let group = L.featureGroup().addTo(map);
    this.set('featuresLayer', group);
  }),

  actions: {
    /**
      Handles click on a close button.

      @method actions.findIntersections
    */
    closePanel() {
      let group = this.get('featuresLayer');
      group.clearLayers();
      let serviceLayer = this.get('serviceLayer');
      if (!Ember.isNone(serviceLayer)) {
        serviceLayer.clearLayers();
      }

      this.send('selectFeature', null);
      this.sendAction('closeComparePanel');
    },

    /**
      Handles click on tab.

      @method actions.hidePanel
    */
    hidePanel() {
      this.toggleProperty('folded');
    },

    /**
      Handles click on pan to icon.

      @method actions.panToIntersection
      @param {Object} geometry Contain intersection | non-intersection geometry. (Maybe contain many geometries)
    */
    panToIntersection(geometry) {
      if (!Ember.isNone(geometry)) {
        let featureLayer = null;
        if (geometry.type === 'GeometryCollection') {
          featureLayer = L.featureGroup();
          geometry.geometries.forEach(geom => {
            featureLayer.addLayer(this._convertGeometryToFeatureLayer(geom));
          });
        } else {
          featureLayer = this._convertGeometryToFeatureLayer(geometry);
        }

        if (!Ember.isNone(featureLayer)) {
          let center = featureLayer.getBounds().getCenter();
          let leafletMap = this.get('leafletMap');
          leafletMap.panTo(center);
        }
      }
    },

    /**
      Handles click on zoom to icon.

      @method actions.zoomToIntersection
      @param {Object} geometry Contain intersection | non-intersection geometry. (Maybe contain many geometries)
    */
    zoomToIntersection(geometry) {
      if (!Ember.isNone(geometry)) {
        let group = this.get('featuresLayer');
        group.clearLayers();
        let featureLayer = null;
        if (geometry.type === 'GeometryCollection') {
          featureLayer = L.featureGroup();
          geometry.geometries.forEach(geom => {
            featureLayer.addLayer(this._convertGeometryToFeatureLayer(geom, {
              style: { color: 'green' }
            }));
          });
        } else {
          featureLayer = this._convertGeometryToFeatureLayer(geometry, {
            style: { color: 'green' }
          });
        }

        if (!Ember.isNone(featureLayer)) {
          featureLayer.addTo(group);
          let map = this.get('leafletMap');
          map.fitBounds(featureLayer.getBounds());
        }
      }
    }
  },

  /**
      Convert feature coordinate.

      @method actions._convertGeometryToFeatureLayer
      @param {Object} geometry Contain coordinates
      @param {Object} style Contain style if need to paint feature
      @returns {Object} geoJSON layer
    */
  _convertGeometryToFeatureLayer(geometry, style) {
    if (!Ember.isBlank(geometry.coordinates[0])) {
      let copyGeometry = Object.assign({}, geometry);
      let mapModel = this.get('mapApi').getFromApi('mapModel');
      let convertedFeatureLayer = mapModel._convertObjectCoordinates(this.get('crsCode'), { geometry: copyGeometry });
      return L.geoJSON(convertedFeatureLayer.geometry, style);
    }
  },

  convertCoordinates(feature) {
    if (Ember.get(feature, 'leafletLayer.options.crs.code')) {
      let mapModel = this.get('mapApi').getFromApi('mapModel');
      return feature.leafletLayer.options.crs.code === 'EPSG:4326' ?
        feature : mapModel._convertObjectCoordinates(Ember.get(feature, 'leafletLayer.options.crs.code'), feature);
    }

    return feature;
  },

  getIntersection(firstObject, secondObject) {
    let intersection = firstObject.intersection(secondObject);
    if (!intersection.isEmpty()) {
      let geojsonWriter = new jsts.io.GeoJSONWriter();
      let intersectionRes = geojsonWriter.write(intersection);

      if (intersectionRes) {
        intersectionRes.area = intersection.getArea().toFixed(3);
        return this.getObjectWithProperties(intersectionRes);
      }
    }

    return { area: '0.000', intersectionCoordsText: '' };
  },

  getNonIntersection(firstObject, secondObject) {
    let nonIntersection = firstObject.symDifference(secondObject);
    if (!nonIntersection.isEmpty()) {
      let geojsonWriter = new jsts.io.GeoJSONWriter();
      let nonIntersectionRes = geojsonWriter.write(nonIntersection);

      if (nonIntersectionRes) {
        nonIntersectionRes.area = nonIntersection.getArea().toFixed(3);
        return this.getObjectWithProperties(nonIntersectionRes);
      }
    }

    return { area: '0.000', intersectionCoordsText: '' };
  },

  getObjectWithProperties(jstsGeometry) {
    if (jstsGeometry) {
      jstsGeometry.intersectionCoordsText = '';
      if (jstsGeometry.type === 'GeometryCollection') {
        jstsGeometry.geometries.forEach((geometry) => {
          jstsGeometry.intersectionCoordsText += coordinatesToString(geometry.coordinates) + '\n';
        });
      } else {
        jstsGeometry.intersectionCoordsText = coordinatesToString(jstsGeometry.coordinates);
      }

      return jstsGeometry;
    }

    return null;
  }
});
