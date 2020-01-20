import Ember from 'ember';
import layout from '../templates/components/compare-object-geometries-panel';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import area from 'npm:@turf/area';
import distance from 'npm:@turf/distance';
import helpers from 'npm:@turf/helpers';
import projection from 'npm:@turf/projection';
import intersect from 'npm:@turf/intersect';
import difference from 'npm:@turf/difference';
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
      let firstObject =  two[0];
      let secondObject =  two[1];
      firstObject = this.convertCoordinates(firstObject);
      secondObject = this.convertCoordinates(secondObject);
      Ember.set(firstObject, 'area', area(firstObject).toFixed(3));
      Ember.set(secondObject, 'area', area(secondObject).toFixed(3));

      this.set('firstObject', firstObject);
      this.set('secondObject', secondObject);
      let dist = this.getDistance(firstObject, secondObject);
      this.set('distanceBetween', dist);
      this.set('intersection', this.getIntesection(firstObject, secondObject));
      this.set('nonIntersection', this.getNonIntersection(firstObject, secondObject));
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
    panToIntersection(feature) {
      if (Ember.get(feature, 'crs') === 'EPSG:3857') {
        feature = projection.toWgs84(feature);
      }

      let center = L.geoJSON(feature).getLayers()[0].getBounds().getCenter();
      let leafletMap = this.get('leafletMap');
      leafletMap.panTo(center);
    },

    /**
      Handles click on zoom to icon.

      @method actions.hidePanel
    */
    zoomToIntersection(feature) {
      if (Ember.get(feature, 'crs') === 'EPSG:3857') {
        feature = projection.toWgs84(feature);
      }

      let group = this.get('featuresLayer');
      group.clearLayers();
      let obj = L.geoJSON(feature, {
        style: { color: 'green' }
      });
      obj.addTo(group);
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
      return feature.leafletLayer.options.crs.code === 'EPSG:4326' ? feature : projection.toWgs84(feature);
    }

    return feature;
  },

  getIntesection(firstObject, secondObject) {
    let intersection = intersect.default(firstObject, secondObject);
    if (intersection) {
      if (Ember.get(firstObject, 'leafletLayer.options.crs.code')) {
        intersection.crs = Ember.get(firstObject, 'leafletLayer.options.crs.code');
      }

      return this.getObjectWithProperties(intersection);
    }

    return null;
  },

  getNonIntersection(firstObject, secondObject) {
    let nonIntersection = difference.default(firstObject, secondObject);
    if (nonIntersection) {
      if (Ember.get(firstObject, 'leafletLayer.options.crs.code')) {
        nonIntersection.crs = Ember.get(firstObject, 'leafletLayer.options.crs.code');
      }

      return this.getObjectWithProperties(nonIntersection);
    }

    return null;
  },

  getObjectWithProperties(feature) {
    if (feature) {
      feature.area = area(feature).toFixed(3);
      feature.intersectionCords = [];
      if (Ember.get(feature, 'crs') === 'EPSG:3857') {
        feature = projection.toMercator(feature);
      }

      feature.geometry.coordinates.forEach(arr => {
        arr.forEach(pair => {
          if (feature.geometry.type === 'MultiPolygon') {
            pair.forEach(cords => {
              feature.intersectionCords.push(cords);
            });
          } else {
            feature.intersectionCords.push(pair);
          }
        });
      });
      return feature;
    }

    return null;
  }
});
