import Ember from 'ember';
import layout from '../templates/components/layer-result-list';

export default Ember.Component.extend({

  /**
    Flag: indicates when one or more results contains more than 0 features
    @property _hasData
    @type boolean
    @default false
   */
  _hasData: false,

  /**
    Flag: inciates when one or more results.features promises rejected
    @property _hasError
    @type boolean
    @default false
   */
  _hasError: false,

  /**
    Current selected feature
    @property _selectedFeature
    @type GeoJSON feature
    @default null
   */
  _selectedFeature: null,

  classNames: ['layer-result-list'],

  layout,

  /**
    FeatureGroup for place layer from selectedFeature
    @property serviceLayer
    @type L.FeatureGroup
    @default null
   */
  serviceLayer: null,

  /**
    Leaflet map object for zoom and pan
    @property leafletMap
    @type L.Map
    @default null
   */
  leafletMap: null,

  /**
    Array of results for display, each result contains object with following properties
    layerModel - MapLayer model
    features - promise for array of GeoJSON features
    @property results
    @type Ember.A()
    @default null
   */
  results: null,

  actions: {
    /**
      Set selected feature and add its layer to serviceLayer on map
      @method actions.selectFeature
     */
    selectFeature(feature) {
      let selectedFeature = this.get('_selectedFeature');
      let serviceLayer = this.get('serviceLayer');
      if (selectedFeature !== feature) {
        if (!Ember.isNone(selectedFeature)) {
          serviceLayer.removeLayer(selectedFeature.leafletLayer);
        }

        if (!Ember.isNone(feature)) {
          serviceLayer.addLayer(feature.leafletLayer);
        }

        this.set('_selectedFeature', feature);
      }
    },

    /**
      Select passed feature and zoom map to its layer bounds
      @method actions.zoomTo
     */
    zoomTo(feature) {
      this.send('selectFeature', feature);

      let bounds;
      if (typeof (feature.leafletLayer.getBounds) === 'function') {
        bounds = feature.leafletLayer.getBounds();
      } else {
        let ll = feature.leafletLayer.getLatLng();
        bounds = L.latLngBounds(ll, ll);
      }

      // TODO: pass action with zoomTo bounds outside
      this.get('leafletMap').fitBounds(bounds.pad(1));
    },

    /**
      Select passed feature and pan map to its layer centroid
      @method actions.panTo
     */
    panTo(feature) {
      this.send('selectFeature', feature);

      let latLng;
      if (typeof (feature.leafletLayer.getBounds) === 'function') {
        latLng = feature.leafletLayer.getBounds().getCenter();
      } else {
        latLng = feature.leafletLayer.getLatLng();
      }

      // TODO: pass action with panTo latLng outside
      this.get('leafletMap').panTo(latLng);
    }
  },

  /**
    Observer for passed results
    @method _resultObserver
   */
  _resultObserver: Ember.observer('results', function () {
    this.send('selectFeature', null);
    this.set('_showLoader', true);
    this.set('_hasError', false);

    let results = this.get('results') || [];

    let promises = results.map((result) => { return result.features; });

    Ember.RSVP.all(promises).then(
      (features) => {
        let featuresCount = features.reduce((sum, feature) => { return sum + feature.length; }, 0);
        this.set('_hasData', featuresCount > 0);
      },
      (error) => {
        this.set('_hasData', true);
        this.set('_hasError', true);
      }
    ).finally(() => {
      this.set('_showLoader', false);
    });
  })
});
