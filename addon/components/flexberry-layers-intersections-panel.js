import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-intersections-panel';
import intersect from 'npm:@turf/intersect';
export default Ember.Component.extend({
  layout,

  // Слой пересечений
  resultsLayer: null,

  // Векторыне слои
  vectorLayers: [],

  // Карта
  leafletMap: null,

  _OnMapChanged: Ember.observer('leafletMap', function() {
    let map = this.get('leafletMap');
    let group = L.featureGroup().addTo(map);
    this.set('resultsLayer', group);
  }),

  // Кнопка выгрузить заблокана
  noIntersectionResults: true,

  // Площадь
  square: 0,

  // Буфер поиска
  bufferR: 0,

  // Выбранные слои
  selectedLayers: [],

  // Результаты идентификации
  results: [],

  // Объект с которым ищем пересечения
  feature: null,

  // Свернут
  folded: false,

  store: Ember.inject.service(),

  _OnFeatureChange: Ember.observer('feature', function() {
    this.ClearPanel();
  }),

  init() {
    this._super(...arguments);

    let settings = this.get('settings');
    if (Ember.isNone(settings)) {
      settings = {
        withToolbar: false,
        sidebarOpened: false,
      };

      this.set('settings', settings);

      this.set('_selectedUnit', 'meters');
    }

    let vlayers = [];
    vlayers = this.get('store').peekAll('new-platform-flexberry-g-i-s-map-layer')
      .filter(layer=> layer.get('type') === 'geojson' || layer.get('type') === 'wfs');
    this.set('vectorLayers', vlayers);
  },
  actions:{
    findIntersections() {
      let selectedLayers = this.get('selectedLayers');

      let store = this.get('store');

      //Object clicked on menu
      let currentFeature = this.get('feature');

      let polygonLayer;

      let bufferedMainPolygonLayer;

      let latlng;

      let selected = Ember.A();

      selectedLayers.forEach(function(item) {
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

      // Show map loader.
      let i18n = this.get('i18n');
      let leafletMap = this.get('leafletMap');
      leafletMap.setLoaderContent(i18n.t('map-tools.identify.loader-message'));
      leafletMap.showLoader();
      this._startIdentification({
        polygonLayer: polygonLayer,
        bufferedMainPolygonLayer: bufferedMainPolygonLayer,
        latlng: latlng,
        selectedLayers: selected });
    },

    closePanel() {
      this.sendAction('closeIntersectionPanel');
    },

    hidePanel() {
      this.toggleProperty('folded');
    }
  },

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
    this.set('noIntersectionResults', false);

    //test
    e.results[0].features.then((features)=> {
      features.forEach((item)=> {
        if (item.geometry.type === 'Polygon') {
          let res = intersect(item, polygonLayer.feature);
          console.log(res);
          let group = this.get('resultsLayer');
          L.geoJSON(res, {
            style: { color: 'green' }
          }).addTo(group);
        }
      });
      let map = this.get('leafletMap');
      var polygonPoints = [
      [58.0079743, 56.241384],
      [58.0112028, 56.2506031],
      [58.0004668, 56.2556064],
      [57.9991075, 56.2922359]];

      // var group = L.featureGroup().addTo(map);
      var poly = L.polygon(polygonPoints).setStyle({
        color: 'green'
      });
      let group = this.get('resultsLayer');
      poly.addTo(group);
    });
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
    leafletMap.setLoaderContent('');
    leafletMap.hideLoader();

    //Assign current tool's boundingBoxLayer
    let polygonLayer = Ember.get(e, 'polygonLayer');
    this.set('polygonLayer', polygonLayer);

    // Assign current tool's boundingBoxLayer
    let bufferedLayer = Ember.get(e, 'bufferedMainPolygonLayer');
    this.set('bufferedMainPolygonLayer', bufferedLayer);

    // Fire custom event on leaflet map.
    //leafletMap.fire('flexberry-map:identificationFinished', e);
  },
  ClearPanel() {
    this.set('square', 0);
    this.set('bufferR', 0);
    this.set('results', []);
    this.set('noIntersectionResults', true);
    this.set('folded', false);
  }
});
