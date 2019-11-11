import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-intersections-panel';
import intersect from 'npm:@turf/intersect';
import area from 'npm:@turf/area';
import lineIntersect from 'npm:@turf/line-intersect';
import * as buffer from 'npm:@turf/buffer';
import VectorLayer from '../layers/-private/vector';
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
  _OnMapChanged: Ember.observer('leafletMap', function () {
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
  square: 0,

  /**
    Buffer radius in selected units.

    @property bufferR
    @type Number
    @default 0
  */
  bufferR: 0,

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

    @property folded
    @type Ember.store
  */
  store: Ember.inject.service(),

  /**
    Observer for feature. If changed=> clear form.

    @property _OnMapChanged
    @private
    @readonly
  */
  _OnFeatureChange: Ember.observer('feature', function () {
    this.clearPanel();
  }),

  /**
    "Layers" label locale key.

    @property __layersLabel
    @type String
    @default 'components.flexberry-layers-intersections-panel.layers-list'
  */
  _layersLabel: 'components.flexberry-layers-intersections-panel.layers-list',

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let vlayers = [];
    this.get('layers').forEach(item => {
      let layers = Ember.get(item, 'layers');
      if (layers.length > 0) {
        layers.forEach(layer => {
          let className = Ember.get(layer, 'type');
          let layerType = Ember.getOwner(this).knownForType('layer', className);
          if (layerType instanceof VectorLayer) {
            vlayers.push(layer);
          }
        });
      } else {
        let className = Ember.get(item, 'type');
        let layerType = Ember.getOwner(this).knownForType('layer', className);
        if (layerType instanceof VectorLayer) {
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

      let latlng;

      let selected = Ember.A();

      let bufferR = this.get('bufferR');

      selectedLayers.forEach(function (item) {
        let result = store.peekRecord('new-platform-flexberry-g-i-s-map-layer', item);
        selected.pushObject(result);
      });

      // If current feature is L.FeatureGroup
      if (currentFeature.leafletLayer.hasOwnProperty('_layers')) {
        if (currentFeature.leafletLayer.getLayers().length === 1) {
          polygonLayer = currentFeature.leafletLayer.getLayers()[0];
        } else {
          throw new Ember.Error(' L.FeatureGroup с несколькими дочерними слоями пока не поддерживается.');
        }
      } else {
        polygonLayer = currentFeature.leafletLayer;
      }

      latlng = polygonLayer.getBounds().getCenter();

      bufferedMainPolygonLayer = polygonLayer;

      if (bufferR > 0) {
        polygonLayer.feature = buffer.default(polygonLayer.toGeoJSON(), bufferR, { units: 'meters' });
      }

      // Show map loader.
      let leafletMap = this.get('leafletMap');
      leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.loader-message') });
      this._startIdentification({
        polygonLayer: polygonLayer,
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
      let group = this.get('resultsLayer');
      group.clearLayers();
      this.sendAction('closeIntersectionPanel');
      this.removeLayers();
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
          // Show new features.
          features.forEach((feature) => {
            let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
            if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
              leafletLayer.setStyle({
                color: 'salmon',
                weight: 2,
                fillOpacity: 0.3
              });
            }

            Ember.set(feature, 'leafletLayer', leafletLayer);
          });
        });
    });

    // Hide map loader.
    let leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.loader.hide({ content: '' });

    //Assign current tool's boundingBoxLayer
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
    this.set('square', 0);
    this.set('bufferR', 0);
    this.set('results', []);
    this.set('noIntersectionResults', true);
    this.set('folded', false);
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
            Ember.get(feature, 'leafletLayer').remove();
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
    let square = this.get('square');
    e.results.forEach((layer) => {
      layer.features.then((features) => {
        features.forEach((item) => {
          if (item.geometry.type === 'Polygon' || item.geometry.type === 'MultiPolygon') {
            let res = intersect.default(item, e.polygonLayer.feature);
            if (res) {
              if (square > 0) {
                if (area(res) > square) {
                  item.intersection = {};
                  item.intersection.intersectionCords = [];
                  item.intersection.intersectedArea = area(res);
                  res.geometry.coordinates.forEach(arr => {
                    arr.forEach(pair => {
                      item.intersection.intersectionCords.push(pair);
                    });
                  });
                  item.intersection.intersectedObject = res;
                  if (res.geometry.type === 'Polygon' || res.geometry.type === 'MultiPolygon') {
                    item.intersection.isPolygon = true;
                  }
                }
              } else {
                item.intersection = {};
                item.intersection.intersectionCords = [];
                item.intersection.intersectedArea = area(res);
                res.geometry.coordinates.forEach(arr => {
                  arr.forEach(pair => {
                    item.intersection.intersectionCords.push(pair);
                  });
                });
                item.intersection.intersectedObject = res;
                if (res.geometry.type === 'Polygon' || res.geometry.type === 'MultiPolygon') {
                  item.intersection.isPolygon = true;
                }
              }
            }
          } else if (item.geometry.type === 'MultiLineString' || item.geometry.type === 'LineString') {
            let intersects = lineIntersect(item, e.polygonLayer.feature);

            if (intersects) {
              item.intersection = {};
              item.intersection.intersectionCords = [];
              intersects.features.forEach(function (feat) {
                item.intersection.intersectionCords.push(feat.geometry.coordinates);
              });
              item.intersection.intersectedObject = intersects;
            }
          }
        });
      });
    });
  },
});
