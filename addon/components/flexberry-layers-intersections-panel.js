import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-intersections-panel';
import * as buffer from 'npm:@turf/buffer';
import * as jsts from 'npm:jsts';
import { coordinatesToArray } from '../utils/coordinates-to';
import { zoomToBounds } from '../utils/zoom-to-bounds';

/**
  The component for searching for intersections with selected feature.

  @class FlexberryLayersAttributesPanelComponent
  @uses LeafletZoomToFeatureMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend({
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
    Layer contains layers of intersection results
    @property serviceLayer
    @type Object
    @default null
  */
  serviceLayer: null,

  activeIntersectionColor: '#008000',

  defaultIntersectionStyle: { color: '#3388FF', weight: 2, fillOpacity: 0 },

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
  store: Ember.inject.service(),

  /**
    Injected map Api.

    @property mapApi
    @type Servie
  */
  mapApi: Ember.inject.service(),

  /**
    Observer for feature. If changed=> clear form.

    @property _OnMapChanged
    @private
    @readonly
  */
  _OnFeatureChange: Ember.observer('feature', function () {
    this.clearPanel();
    let feature = this.get('feature');
    if (!feature) {
      return;
    }

    let leafletMap = this.get('leafletMap');
    let serviceLayer = this.get('serviceLayer');
    if (!leafletMap.hasLayer(serviceLayer)) {
      serviceLayer.addTo(leafletMap);
    }

    let layerCopy = L.geoJson(feature.leafletLayer.toGeoJSON());

    layerCopy.setStyle(this.get('defaultIntersectionStyle'));

    Ember.set(feature, 'leafletLayer', layerCopy.getLayers()[0]);
    Ember.set(feature.leafletLayer, 'defaultOptions', Object.assign({}, { defaultFeatureStyle: feature.leafletLayer.options }));
    Ember.set(feature.leafletLayer, 'feature', feature);

    serviceLayer.addLayer(feature.leafletLayer);
  }),

  _checkTypeLayer(layer) {
    let className = Ember.get(layer, 'type');
    let layerClass = Ember.isNone(className) ?
      null :
      Ember.getOwner(this).knownForType('layer', className);

    return !Ember.isNone(layerClass) && layerClass.isVectorType(layer, true);
  },

  filteredVectorLayers: Ember.computed('vectorLayers', 'feature', function () {
    let currentLayerId = this.get('feature.layerModel.id');
    let vectorLayers = this.get('vectorLayers');

    return Ember.isNone(currentLayerId) ? vectorLayers : vectorLayers.filter((l) => { return l.id !== currentLayerId; });
  }),

  /**
    loads layers into a list to search for intersections. Casts the tree structure to a list.

    @method loadIntersectionLayers
    @param {Object[]} layers root of layers tree
    @return {Object[]} list of layers

  */
  loadIntersectionLayers(layers) {
    if (!layers) {
      return [];
    }

    let vlayers = [];
    layers.forEach(layer => {
      let innerLayers = Ember.get(layer, 'layers');
      if (!innerLayers) {
        return;
      }

      if (Ember.get(innerLayers, 'length') > 0) {
        vlayers.push(...this.loadIntersectionLayers(innerLayers));
      } else {
        if (this._checkTypeLayer(layer)) {
          vlayers.push(layer);
        }
      }
    });

    return vlayers;
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.set('vectorLayers', this.loadIntersectionLayers(this.get('layers')));
    this.set('serviceLayer', L.featureGroup());
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
      let bufferR = Ember.isNone(this.get('bufferR')) ? 0 : this.get('bufferR');

      let latlng;
      let workingPolygon;
      let selected = Ember.A();

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

      @method actions.closePanel
    */
    closePanel() {
      this.clearPanel();
      let leafletMap = this.get('leafletMap');
      let serviceLayer = this.get('serviceLayer');
      if (leafletMap.hasLayer(serviceLayer)) {
        leafletMap.removeLayer(serviceLayer);
      }

      this.sendAction('closeIntersectionPanel');
    },

    /**
      Clear selected layers.
      Also handles closeAll event from select-with-checkbox component.

      @method actions.clearSelected
    */
    clearSelected() {
      Ember.$('.search-field').val('');
      Ember.$('.fb-selector .item.filtered').each((i, item) => {
        Ember.$(item).removeClass('filtered');
      });
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

      @method actions.zoomToIntersection
      @param {Object} feature object from which to form the intersection with the main object (this.feature)
    */
    zoomToIntersection(feature) {
      let serviceLayer = this.get('serviceLayer');
      let leafletMap = this.get('leafletMap');

      this.clearFeaturesStyle().then(() => {
        let intersectionLayer = feature.intersection.intersectionLayer || this.createIntersectionLayer(feature);
        this.activateIntersection(intersectionLayer);
        if (!serviceLayer.hasLayer(intersectionLayer)) {
          intersectionLayer.addTo(serviceLayer);
        }

        let bounds = intersectionLayer.getBounds();
        let minZoom = Ember.get(intersectionLayer, 'minZoom');
        let maxZoom = Ember.get(intersectionLayer, 'maxZoom');
        zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
      });
    },

    /**
      Handles click on pan icon.

      @method actions.panToIntersection
      @param {Object} feature Selected feature to pan.
    */
    panToIntersection(feature) {
      this.clearFeaturesStyle().then(() => this.activateIntersection(feature.leafletLayer));
    },

    /**
      Handles input limit.

      @method actions.inputLimit
    */
    inputLimit(str, e) {
      const regex = /^\.|[^\d\.]|\.(?=.*\.)|^0+(?=\d)/g;
      if (!Ember.isEmpty(str) && regex.test(str)) {
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
      excludedLayers: Ember.A(excludedLayers || []),
      layers: selectedLayers,
      results: Ember.A()
    };

    // Fire custom event on leaflet map (if there is layers to identify).
    if (e.layers.length > 0) {
      leafletMap.fire('flexberry-map:identify', e);
    }

    // Promises array could be totally changed in 'flexberry-map:identify' event handlers, we should prevent possible errors.
    e.results = Ember.isArray(e.results) ? e.results : Ember.A();
    let promises = Ember.A();

    // Handle each result.
    // Detach promises from already received features.
    e.results.forEach((result) => {
      if (Ember.isNone(result)) {
        return;
      }

      let features = Ember.get(result, 'features');

      if (!(features instanceof Ember.RSVP.Promise)) {
        return;
      }

      promises.pushObject(features);
    });

    // Wait for all promises to be settled & call '_finishIdentification' hook.
    Ember.RSVP.allSettled(promises).then(() => {
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
      identificationResult.features.then((features) => {
        // Show identification result features
        features.forEach((feature) => {
          let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
          let weight = 0;
          let fillOpacity = 0;

          if (feature.intersection) {
            weight = 2;
            fillOpacity = 0.2;
          }

          if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
            leafletLayer.setStyle({
              color: 'salmon',
              weight: weight,
              fillOpacity: fillOpacity
            });
          }

          Ember.set(feature, 'leafletLayer', leafletLayer);
          Ember.set(feature.leafletLayer, 'defaultOptions', { defaultFeatureStyle: Object.assign({}, feature.leafletLayer.options) });
        });
      });
    });

    // Hide map loader.
    let leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.loader.hide({ content: '' });

    // Assign current tool's boundingBoxLayer
    let polygonLayer = Ember.get(e, 'polygonLayer');
    this.set('polygonLayer', polygonLayer);

    // Assign current tool's boundingBoxLayer
    let bufferedLayer = Ember.get(e, 'bufferedMainPolygonLayer');
    this.set('bufferedMainPolygonLayer', bufferedLayer);

  },

  /**
    Cleaning after changing feature.

    @method clearPanel
  */
  clearPanel() {
    this.get('serviceLayer').clearLayers();
    this.removeLayers();
    this.set('selectedLayers', []);
    this.set('square', null);
    this.set('bufferR', null);
    this.set('results', []);
    this.set('noIntersectionResults', true);
    this.set('folded', false);

    if (!Ember.isNone(this.childViews[0].get('state'))) {
      this.childViews[0].get('state').setEach('isVisible', false);
    }

    this.send('clearSelected');
  },

  /**
    Removing layers with identification results.

    @method removeLayers
  */
  removeLayers() {
    let res = this.get('results');
    res.forEach((identificationResult) => {
      identificationResult.features.then((features) => {
          features.forEach((feature) => {
            Ember.get(feature, 'leafletLayer').remove();
          });
        });
    });
    this.set('results', []);
  },

  createIntersectionLayer (feature) {
    let intersectedObject = feature.intersection.intersectedObject;

    let intersectionLayer = L.geoJSON(intersectedObject, {
      style: { color: this.get('activeIntersectionColor')},
      coordsToLatLng: intersectedObject.coordsToLatLng,
      defaultFeatureStyle: this.get('defaultIntersectionStyle')
    });

    Ember.set(feature.intersection, 'intersectionLayer', intersectionLayer.getLayers()[0]);

    return intersectionLayer;
  },

  clearFeaturesStyle() {
    let promises = Ember.A();
    let serviceLayer = this.get('serviceLayer');
    let feature = this.get('feature');
    let intersectionResults = this.get('results');

    serviceLayer.clearLayers();
    feature.leafletLayer.addTo(serviceLayer);

    intersectionResults.forEach((intersectionResult) => {
      promises.pushObject(intersectionResult.features);
    });

    return Ember.RSVP.allSettled(promises).then((results) => {
      let features = results.map(result => result.value).flat(1);

      features.forEach(feature => this.setDefaultFeatureStyle(feature));
    });
  },

  setDefaultFeatureStyle(feature) {
    let featureLayer = feature.leafletLayer;
    let defaultStyle = feature.leafletLayer.defaultOptions.defaultFeatureStyle;

    featureLayer.setStyle(defaultStyle);
  },

  activateIntersection(intersectionLayer) {
    let activeIntersectionColor = this.get('activeIntersectionColor');

    intersectionLayer.setStyle({color: activeIntersectionColor});
  },

  /**
    Searching intersections.

    @method _findIntersections
    @param {Object[]} e Objects describing identification results.
    @private
  */
  _findIntersections(e) {
    let $listLayer = Ember.$('.fb-selector .menu');
    if ($listLayer.hasClass('visible')) {
      $listLayer.removeClass('visible');
      $listLayer.addClass('hidden');
    }

    let square = Ember.isNone(this.get('square')) ? 0 : this.get('square');
    e.results.forEach((layer) => {
      layer.features.then((features) => {
        features.forEach((item) => {
          let objA = item.leafletLayer.toGeoJSON();
          let objB = e.polygonLayer.toGeoJSON();
          item.isIntersect = false;
          if (objB.id !== objA.id) {
            let crs = item.leafletLayer.options.crs;
            if (Ember.isNone(crs)) {
              crs = this.get('leafletMap').options.crs;
            }

            let coordsToLatLng = function(coords) {
              return crs.unproject(L.point(coords));
            };

            let objAJsts = item.leafletLayer.toJsts(crs);
            let objBJsts = e.polygonLayer.toJsts(crs);
            let intersected = objAJsts.intersection(objBJsts);
            let areaIntersection = intersected.getArea().toFixed(3);
            let geojsonWriter = new jsts.default.io.GeoJSONWriter();
            let res = geojsonWriter.write(intersected);
            if (res && areaIntersection >= square && intersected.isValid()) {
              item.isIntersect = true;
              item.intersection = {};
              item.intersection.intersectionCords = this.computeCoordinates(res);
              item.intersection.intersectedArea = areaIntersection;
              item.intersection.intersectedObject = res;
              item.intersection.intersectedObject.coordsToLatLng = coordsToLatLng;
              if (res.type === 'Polygon' || res.type === 'MultiPolygon') {
                item.intersection.isPolygon = true;
              }
            } else {
              console.error('Intersection layer is not valid');
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
