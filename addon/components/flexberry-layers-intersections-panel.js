import $ from 'jquery';
import { Promise, allSettled } from 'rsvp';
import { A, isArray } from '@ember/array';
import { getOwner } from '@ember/application';
import { isNone, isEmpty, typeOf } from '@ember/utils';
import { inject as service } from '@ember/service';
import { observer, get, set } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/flexberry-layers-intersections-panel';
import * as buffer from 'npm:@turf/buffer';
import * as jsts from 'npm:jsts';
import { coordinatesToArray } from '../utils/coordinates-to';

/**
  The component for searching for intersections with selected feature.

  @class FlexberryLayersAttributesPanelComponent
  @uses LeafletZoomToFeatureMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Object name disaplayed on template.
    @property disaplayName
    @type String
    @default null
  */
  disaplayName: null,

  /**
    Layer contains identification result features.

    @property resultsLayer
    @type Object
    @default null
  */
  resultsLayer: null,

  /**
    List vector layers.

    @property vectorLayers
    @type Array
    @default []
  */
  vectorLayers: [],

  /**
    Leaflet map object for zoom and pan.

    @property leafletMap
    @type L.Map
    @default null
  */
  leafletMap: null,

  /**
    Observer for leafletMap property adding layer with results.

    @property _OnMapChanged
    @private
    @readonly
  */
  _OnMapChanged: observer('leafletMap', function () {
    let map = this.get('leafletMap');
    let group = L.featureGroup().addTo(map);
    this.set('resultsLayer', group);
  }),

  /**
    Flag indicates if there are any results of intersection.

    @property noIntersectionResults
    @type Boolean
    @default true
  */
  noIntersectionResults: true,

  /**
    intersection area over which to look.

    @property square
    @type Number
    @default 0
  */
  square: null,

  /**
    Buffer radius in selected units.

    @property bufferR
    @type Number
    @default 0
  */
  bufferR: null,

  /**
    List of selected vector layers.

    @property selectedLayers
    @type Array
    @default []
  */
  selectedLayers: [],

  /**
    List of intersection results.

    @property  results
    @type Array
    @default []
  */
  results: [],

  /**
    Selected feature.

    @property  feature
    @type Object
    @default null
  */
  feature: null,

  /**
    Flag indicates if panel is folded.

    @property folded
    @type Boolean
    @default false
  */
  folded: false,

  /**
    Injected ember storage.

    @property store
    @type Ember.store
  */
  store: service(),

  /**
    Injected map Api.

    @property mapApi
    @type Servie
  */
  mapApi: service(),

  /**
    Observer for feature. If changed=> clear form.

    @property _OnMapChanged
    @private
    @readonly
  */
  _OnFeatureChange: observer('feature', function () {
    this.clearPanel();
  }),

  _checkTypeLayer(layer) {
    let className = get(layer, 'type');
    let layerClass = isNone(className) ?
      null :
      getOwner(this).knownForType('layer', className);

    return !isNone(layerClass) && layerClass.isVectorType(layer, true);
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let vlayers = [];
    this.get('layers').forEach(item => {
      let layers = get(item, 'layers');
      if (layers.length > 0) {
        layers.forEach(layer => {
          if (this._checkTypeLayer(layer)) {
            vlayers.push(layer);
          }
        });
      } else {
        if (this._checkTypeLayer(item)) {
          vlayers.push(item);
        }
      }
    });
    this.set('vectorLayers', vlayers);
  },

  actions: {
    /**
      Handles click on a button.
      @method actions.findIntersections
    */
    findIntersections() {
      this.removeLayers();
      let selectedLayers = this.get('selectedLayers');

      let store = this.get('store');

      //Object clicked on menu
      let currentFeature = this.get('feature');

      let polygonLayer = null;

      let bufferedMainPolygonLayer;
      let bufferR = isNone(this.get('bufferR')) ? 0 : this.get('bufferR');

      let latlng;
      let workingPolygon;
      let selected = A();

      selectedLayers.forEach(function (item) {
        let result = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', item);
        selected.pushObject(result);
      });

      // If current feature is L.FeatureGroup
      if (currentFeature.leafletLayer.hasOwnProperty('_layers')) {
        if (currentFeature.leafletLayer.getLayers().length === 1) {
          polygonLayer = currentFeature.leafletLayer.getLayers()[0];
        } else {
          throw (' L.FeatureGroup с несколькими дочерними слоями пока не поддерживается.');
        }
      } else {
        polygonLayer = currentFeature.leafletLayer;
      }

      latlng = polygonLayer instanceof L.Marker ? polygonLayer.getLatLng() : polygonLayer.getBounds().getCenter();

      if (bufferR > 0) {
        let feat = buffer.default(polygonLayer.toGeoJSON(), bufferR, { units: 'meters' });
        workingPolygon = L.geoJSON(feat).getLayers()[0];
      } else {
        workingPolygon = polygonLayer;
      }

      // Show map loader.
      let leafletMap = this.get('leafletMap');
      leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.loader-message') });
      this._startIdentification({
        polygonLayer: workingPolygon,
        bufferedMainPolygonLayer: bufferedMainPolygonLayer,
        latlng: latlng,
        selectedLayers: selected
      });
    },

    /**
      Handles click on a close button.

      @method actions.findIntersections
    */
    closePanel() {
      this.clearPanel();
      this.sendAction('closeIntersectionPanel');
    },

    /**
      Handles click on tab.

      @method actions.hidePanel
    */
    hidePanel() {
      this.toggleProperty('folded');
    },

    /**
      Handles click on zoom icon.

      @method actions.hidePanel
      @param {Object} feature Selected feature to zoom.
    */
    zoomToIntersection(feature) {
      let group = this.get('resultsLayer');
      group.clearLayers();
      let obj = L.geoJSON(feature.intersection.intersectedObject, {
        style: { color: 'green' }
      });
      obj.addTo(group);
    },

    /**
      Handles input limit.

      @method actions.inputLimit
    */
    inputLimit(str, e) {
      const regex = /^\.|[^\d\.]|\.(?=.*\.)|^0+(?=\d)/g;
      if (!isEmpty(str) && regex.test(str)) {
        this.$(e.target).val(str.replace(regex, ''));
      }
    }
  },
  /**
  Starts identification by array of satisfying layers inside given polygon area.

  @method _startIdentification
  @param {Object} options Method options.
  @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
  @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.polygonLayer Polygon layer related to given area.
  @param {Object[]} options.excludedLayers Layers excluded from identification.
  @param {Object[]} options.selectedLayers Layers selected by user.
  @private
  */
  _startIdentification({
    polygonLayer,
    bufferedMainPolygonLayer,
    latlng,
    excludedLayers,
    selectedLayers
  }) {
    let leafletMap = this.get('leafletMap');

    let e = {
      latlng: latlng,
      polygonLayer: polygonLayer,
      bufferedMainPolygonLayer: bufferedMainPolygonLayer,
      excludedLayers: A(excludedLayers || []),
      layers: selectedLayers,
      results: A()
    };

    // Fire custom event on leaflet map (if there is layers to identify).
    if (e.layers.length > 0) {
      leafletMap.fire('flexberry-map:identify', e);
    }

    // Promises array could be totally changed in 'flexberry-map:identify' event handlers, we should prevent possible errors.
    e.results = isArray(e.results) ? e.results : A();
    let promises = A();

    // Handle each result.
    // Detach promises from already received features.
    e.results.forEach((result) => {
      if (isNone(result)) {
        return;
      }

      let features = get(result, 'features');

      if (!(features instanceof Promise)) {
        return;
      }

      promises.pushObject(features);
    });

    // Wait for all promises to be settled & call '_finishIdentification' hook.
    allSettled(promises).then(() => {
      this._finishIdentification(e);
    });
    this.set('results', e.results);

    if (e.results.length > 0) {
      this.set('noIntersectionResults', false);
      leafletMap.flexberryMap.tools.enable('drag');
    }

    this._findIntersections(e);
  },

  /**
    Finishes identification.

    @method _finishIdentification
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.polygonLayer Polygon layer related to given vertices.
    @param {Object[]} excludedLayers Objects describing those layers which were excluded from identification.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @return {<a href="http://leafletjs.com/reference.html#popup">L.Popup</a>} Popup containing identification results.
    @private
  */
  _finishIdentification(e) {
    e.results.forEach((identificationResult) => {
      identificationResult.features.then(
        (features) => {
          //Show new features.
          features.forEach((feature) => {
            if (feature.intersection) {
              let leafletLayer = get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
              if (typeOf(leafletLayer.setStyle) === 'function') {
                leafletLayer.setStyle({
                  color: 'salmon',
                  weight: 2,
                  fillOpacity: 0.2
                });
              }

              set(feature, 'leafletLayer', leafletLayer);
            } else {
              let leafletLayer = get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
              if (typeOf(leafletLayer.setStyle) === 'function') {
                leafletLayer.setStyle({
                  color: 'salmon',
                  weight: 0,
                  fillOpacity: 0
                });
              }

              set(feature, 'leafletLayer', leafletLayer);
            }
          });
        });
    });

    // Hide map loader.
    let leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.loader.hide({ content: '' });

    //Assign current tool's boundingBoxLayer
    let polygonLayer = get(e, 'polygonLayer');
    this.set('polygonLayer', polygonLayer);

    // Assign current tool's boundingBoxLayer
    let bufferedLayer = get(e, 'bufferedMainPolygonLayer');
    this.set('bufferedMainPolygonLayer', bufferedLayer);

  },

  /**
    Cleaning after changing feature.

    @method clearPanel
  */
  clearPanel() {
    let group = this.get('resultsLayer');
    group.clearLayers();
    this.removeLayers();
    this.set('selectedLayers', []);
    this.set('square', null);
    this.set('bufferR', null);
    this.set('results', []);
    this.set('noIntersectionResults', true);
    this.set('folded', false);

    if (!isNone(this.childViews[0].get('state'))) {
      this.childViews[0].get('state').setEach('isVisible', false);
    }

    $('.search-field').val('');
    $('.fb-selector .item.filtered').each((i, item) => {
      $(item).removeClass('filtered');
    });
  },

  /**
    Removing layers with identification results.

    @method removeLayers
  */
  removeLayers() {
    let res = this.get('results');
    res.forEach((identificationResult) => {
      identificationResult.features.then(
        (features) => {
          features.forEach((feature) => {
            get(feature, 'leafletLayer').remove();
          });
        });
    });
    this.set('results', []);
  },

  /**
    Searching intersections.

    @method _findIntersections
    @param {Object[]} e Objects describing identification results.
    @private
  */
  _findIntersections(e) {
    let $listLayer = $('.fb-selector .menu');
    if ($listLayer.hasClass('visible')) {
      $listLayer.removeClass('visible');
      $listLayer.addClass('hidden');
    }

    let square = isNone(this.get('square')) ? 0 : this.get('square');
    e.results.forEach((layer) => {
      layer.features.then((features) => {
        features.forEach((item) => {
          let objA = item.leafletLayer.toGeoJSON();
          let objB = e.polygonLayer.toGeoJSON();
          item.isIntersect = false;
          if (objB.id !== objA.id) {
            let crs = item.leafletLayer.options.crs;
            let objAJsts = item.leafletLayer.toJsts(crs);
            let objBJsts = e.polygonLayer.toJsts(crs);
            let intersected = objAJsts.intersection(objBJsts);
            let areaIntersection = intersected.getArea().toFixed(3);
            let geojsonWriter = new jsts.default.io.GeoJSONWriter();
            let res = geojsonWriter.write(intersected);
            if (res && areaIntersection >= square) {
              item.isIntersect = true;
              item.intersection = {};
              item.intersection.intersectionCords = this.computeCoordinates(res);
              item.intersection.intersectedArea = areaIntersection;
              item.intersection.intersectedObject = res;
              if (res.type === 'Polygon' || res.type === 'MultiPolygon') {
                item.intersection.isPolygon = true;
              }
            }
          }
        });
      });
    });
  },

  computeCoordinates(feature) {
    if (feature) {
      let coordinatesArray = [];
      if (feature.type === 'GeometryCollection') {
        feature.geometries.forEach((geometry) => {
          coordinatesArray = coordinatesArray.concat(coordinatesToArray(geometry.coordinates));
          coordinatesArray = coordinatesArray.concat(null);
        });
      } else {
        coordinatesArray = coordinatesToArray(feature.coordinates);
      }

      return coordinatesArray;
    }

    return null;
  }
});
