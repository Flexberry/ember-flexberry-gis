import Ember from 'ember';
import layout from '../templates/components/compare-object-geometries-panel';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
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
  _onTwoObjectsChange: Ember.observer('twoObjects.[]', function() {
    let two = this.get('twoObjects');
    if (two.length === 2) {
      let mapModel = this.get('mapApi').getFromApi('mapModel');
      let crs = two[0].layerModel.get('_leafletObject.options.crs');
      this.set('crs', crs);
      let firstObject =  two[0];
      let secondObject = null;
      if (two[1].layerModel.get('_leafletObject.options.crs').code !== crs.code) {
        secondObject = Object.assign({}, two[1]);
        mapModel._convertObjectCoordinates(crs.code, secondObject);
      } else {
        secondObject = two[1];
      }

      let geojsonReader = new jsts.io.GeoJSONReader();
      let firstObjectJstsGeom = geojsonReader.read(firstObject.geometry);
      let secondObjectJstsGeom = geojsonReader.read(secondObject.geometry);
      Ember.set(firstObject, 'area', firstObjectJstsGeom.getArea().toFixed(3));
      Ember.set(secondObject, 'area', secondObjectJstsGeom.getArea().toFixed(3));

      this.set('firstObject', firstObject);
      this.set('secondObject', secondObject);
      let dist = this.getDistance(firstObject, secondObject);
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

      @method actions.hidePanel
    */
    panToIntersection(geometry) {
      if (!Ember.isBlank(geometry.coordinates[0])) {
        let copyGeometry = Object.assign({}, geometry);
        let mapModel = this.get('mapApi').getFromApi('mapModel');
        let convertedFeatureLayer = mapModel._convertObjectCoordinates(this.get('crs').code, { geometry: copyGeometry });
        let featureLayer = L.geoJSON(convertedFeatureLayer.geometry);
        let center = featureLayer.getBounds().getCenter();
        let leafletMap = this.get('leafletMap');
        leafletMap.panTo(center);
      }
    },

    /**
      Handles click on zoom to icon.

      @method actions.hidePanel
    */
    zoomToIntersection(geometry) {
      if (!Ember.isBlank(geometry.coordinates[0])) {
        let group = this.get('featuresLayer');
        group.clearLayers();
        let copyGeometry = Object.assign({}, geometry);
        let mapModel = this.get('mapApi').getFromApi('mapModel');
        let convertedFeatureLayer =  mapModel._convertObjectCoordinates(this.get('crs').code, { geometry: copyGeometry });
        let featureLayer = L.geoJSON(convertedFeatureLayer.geometry, {
          style: { color: 'green' }
        });
        featureLayer.addTo(group);
        let map = this.get('leafletMap');
        map.fitBounds(featureLayer.getBounds());
      }
    }
  },

  getDistance(firstObject, secondObject) {
    let firstCenter;
    let secondCenter;
    if (Ember.get(firstObject, 'leafletLayer.getLayers')) {
      firstCenter = firstObject.leafletLayer.getLayers()[0].getBounds().getCenter();
    } else {
      firstCenter = firstObject.leafletLayer.getBounds().getCenter();
    }

    if (Ember.get(secondObject, 'leafletLayer.getLayers')) {
      secondCenter = secondObject.leafletLayer.getLayers()[0].getBounds().getCenter();
    } else {
      secondCenter = secondObject.leafletLayer.getBounds().getCenter();
    }

    let firstPoint = helpers.point([firstCenter.lat, firstCenter.lng]);
    let secondPoint = helpers.point([secondCenter.lat, secondCenter.lng]);
    return (distance.default(firstPoint, secondPoint, { units: 'kilometers' }) * 1000).toFixed(3);
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
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let intersectionRes = geojsonWriter.write(intersection);

    if (intersectionRes) {
      intersectionRes.area = intersection.getArea().toFixed(3);
      return this.getObjectWithProperties(intersectionRes);
    }
  },

  getNonIntersection(firstObject, secondObject) {
    let nonIntersection = firstObject.symDifference(secondObject);
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let nonIntersectionRes = geojsonWriter.write(nonIntersection);

    if (nonIntersectionRes) {
      nonIntersectionRes.area = nonIntersection.getArea().toFixed(3);
      return this.getObjectWithProperties(nonIntersectionRes);
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
