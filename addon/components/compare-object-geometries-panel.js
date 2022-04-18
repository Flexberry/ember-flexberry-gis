import { isNone, isBlank } from '@ember/utils';
import { observer, set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
import jsts from 'npm:jsts';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import layout from '../templates/components/compare-object-geometries-panel';
import { coordinatesToString } from '../utils/coordinates-to';

export default Component.extend(LeafletZoomToFeatureMixin, {
  layout,

  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
    */
  mapApi: service(),

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
  _onTwoObjectsChange: observer('twoObjects.[]', function () {
    const two = this.get('twoObjects');
    if (two.length === 2) {
      const mapModel = this.get('mapApi').getFromApi('mapModel');
      const crs = two[0].layerModel.get('_leafletObject.options.crs');
      this.set('crs', crs);
      const firstObject = two[0];
      let secondObject = null;
      if (two[1].layerModel.get('_leafletObject.options.crs').code !== crs.code) {
        secondObject = Object.assign({}, two[1]);
        mapModel._convertObjectCoordinates(crs.code, secondObject);
      } else {
        [, secondObject] = two;
      }

      const geojsonReader = new jsts.io.GeoJSONReader();
      const firstObjectJstsGeom = geojsonReader.read(firstObject.geometry);
      const secondObjectJstsGeom = geojsonReader.read(secondObject.geometry);
      set(firstObject, 'area', firstObjectJstsGeom.getArea().toFixed(3));
      set(secondObject, 'area', secondObjectJstsGeom.getArea().toFixed(3));

      this.set('firstObject', firstObject);
      this.set('secondObject', secondObject);
      const dist = this.getDistance(firstObject, secondObject);
      this.set('distanceBetween', dist);
      this.set('intersection', this.getIntersection(firstObjectJstsGeom, secondObjectJstsGeom));
      this.set('nonIntersection', this.getNonIntersection(firstObjectJstsGeom, secondObjectJstsGeom));
    }
  }),

  /**
    First object to compare.

    @property firstObject
    @type Feature
    @default null
  */
  firstObject: null,

  /**
    Second object to compare.

    @property secondObject
    @type Feature
    @default null
  */
  secondObject: null,

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

    @property resultsLayer
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

  crs: null,

  /**
    Observer for leafletMap property adding layer with results.

    @property _OnMapChanged
    @private
    @readonly
  */
  _OnMapChanged: observer('leafletMap', function () {
    const map = this.get('leafletMap');
    const group = L.featureGroup().addTo(map);
    this.set('featuresLayer', group);
  }),

  actions: {
    /**
      Handles click on a close button.

      @method actions.findIntersections
    */
    closePanel() {
      const group = this.get('featuresLayer');
      group.clearLayers();
      const serviceLayer = this.get('serviceLayer');
      if (!isNone(serviceLayer)) {
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
      let featureLayer = null;
      if (geometry.type === 'GeometryCollection') {
        featureLayer = L.featureGroup();
        geometry.geometries.forEach((geom) => {
          featureLayer.addLayer(this._convertGeometryToFeatureLayer(geom));
        });
      } else {
        featureLayer = this._convertGeometryToFeatureLayer(geometry);
      }

      if (!isNone(featureLayer)) {
        const center = featureLayer.getBounds().getCenter();
        const leafletMap = this.get('leafletMap');
        leafletMap.panTo(center);
      }
    },

    /**
      Handles click on zoom to icon.

      @method actions.zoomToIntersection
      @param {Object} geometry Contain intersection | non-intersection geometry. (Maybe contain many geometries)
    */
    zoomToIntersection(geometry) {
      const group = this.get('featuresLayer');
      group.clearLayers();
      let featureLayer = null;
      if (geometry.type === 'GeometryCollection') {
        featureLayer = L.featureGroup();
        geometry.geometries.forEach((geom) => {
          featureLayer.addLayer(this._convertGeometryToFeatureLayer(geom, {
            style: { color: 'green', },
          }));
        });
      } else {
        featureLayer = this._convertGeometryToFeatureLayer(geometry, {
          style: { color: 'green', },
        });
      }

      if (!isNone(featureLayer)) {
        featureLayer.addTo(group);
        const map = this.get('leafletMap');
        map.fitBounds(featureLayer.getBounds());
      }
    },
  },

  /**
      Convert feature coordinate.

      @method actions.zoomToIntersection
      @param {Object} geometry Contain coordinates
      @param {Object} style Contain style if need to paint feature
      @returns {Object} geoJSON layer
    */
  _convertGeometryToFeatureLayer(geometry, style) {
    if (!isBlank(geometry.coordinates[0])) {
      const copyGeometry = Object.assign({}, geometry);
      const mapModel = this.get('mapApi').getFromApi('mapModel');
      const convertedFeatureLayer = mapModel._convertObjectCoordinates(this.get('crs').code, { geometry: copyGeometry, });
      return L.geoJSON(convertedFeatureLayer.geometry, style);
    }
  },

  getDistance(firstObject, secondObject) {
    let firstCenter;
    let secondCenter;
    if (get(firstObject, 'leafletLayer.getLayers')) {
      firstCenter = firstObject.leafletLayer.getLayers()[0].getBounds().getCenter();
    } else {
      firstCenter = firstObject.leafletLayer.getBounds().getCenter();
    }

    if (get(secondObject, 'leafletLayer.getLayers')) {
      secondCenter = secondObject.leafletLayer.getLayers()[0].getBounds().getCenter();
    } else {
      secondCenter = secondObject.leafletLayer.getBounds().getCenter();
    }

    const firstPoint = helpers.point([firstCenter.lat, firstCenter.lng]);
    const secondPoint = helpers.point([secondCenter.lat, secondCenter.lng]);
    return (distance.default(firstPoint, secondPoint, { units: 'kilometers', }) * 1000).toFixed(3);
  },

  convertCoordinates(feature) {
    if (get(feature, 'leafletLayer.options.crs.code')) {
      const mapModel = this.get('mapApi').getFromApi('mapModel');
      return feature.leafletLayer.options.crs.code === 'EPSG:4326'
        ? feature : mapModel._convertObjectCoordinates(get(feature, 'leafletLayer.options.crs.code'), feature);
    }

    return feature;
  },

  getIntersection(firstObject, secondObject) {
    const intersection = firstObject.intersection(secondObject);
    const geojsonWriter = new jsts.io.GeoJSONWriter();
    const intersectionRes = geojsonWriter.write(intersection);

    if (intersectionRes) {
      intersectionRes.area = intersection.getArea().toFixed(3);
      return this.getObjectWithProperties(intersectionRes);
    }
  },

  getNonIntersection(firstObject, secondObject) {
    const nonIntersection = firstObject.symDifference(secondObject);
    const geojsonWriter = new jsts.io.GeoJSONWriter();
    const nonIntersectionRes = geojsonWriter.write(nonIntersection);

    if (nonIntersectionRes) {
      nonIntersectionRes.area = nonIntersection.getArea().toFixed(3);
      return this.getObjectWithProperties(nonIntersectionRes);
    }

    return { area: '0.000', intersectionCoordsText: '', };
  },

  getObjectWithProperties(jstsGeometry) {
    if (jstsGeometry) {
      jstsGeometry.intersectionCoordsText = '';
      if (jstsGeometry.type === 'GeometryCollection') {
        jstsGeometry.geometries.forEach((geometry) => {
          jstsGeometry.intersectionCoordsText += `${coordinatesToString(geometry.coordinates)}\n`;
        });
      } else {
        jstsGeometry.intersectionCoordsText = coordinatesToString(jstsGeometry.coordinates);
      }

      return jstsGeometry;
    }

    return null;
  },
});
