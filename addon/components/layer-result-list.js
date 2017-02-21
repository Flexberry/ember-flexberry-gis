import Ember from 'ember';
import layout from '../templates/components/layer-result-list';

export default Ember.Component.extend({

  actions: {
    selectFeature(feature) {
      let selectedFeature = this.get('selectedFeature');
      let serviceLayer = this.get('serviceLayer');
      if (selectedFeature !== feature) {
        if (!Ember.isNone(selectedFeature)) {
          serviceLayer.removeLayer(selectedFeature.leafletLayer);
        }

        if (!Ember.isNone(feature)) {
          serviceLayer.addLayer(feature.leafletLayer);
        }

        this.set('selectedFeature', feature);
      }
    },

    clearResults() {
      this.selectFeature(null);
      this.set('results', null);
    },

    zoomTo(feature) {
      this.send('selectFeature', feature);

      let bounds;
      if (typeof (feature.leafletLayer.getBounds) === 'function') {
        bounds = feature.leafletLayer.getBounds();
      } else {
        let ll = feature.leafletLayer.getLatLng();
        bounds = L.latLngBounds(ll, ll);
      }

      this.get('leafletMap').fitBounds(bounds.pad(1));
    },

    panTo(feature) {
      this.send('selectFeature', feature);

      let latLng;
      if (typeof (feature.leafletLayer.getBounds) === 'function') {
        latLng = feature.leafletLayer.getBounds().getCenter();
      } else {
        latLng = feature.leafletLayer.getLatLng();
      }

      this.get('leafletMap').panTo(latLng);
    }
  },

  layout,

  classNames: ['layer-result-list'],

  selectedFeature: null,

  /**
    @type L.FeatureGroup
   */
  serviceLayer: null,

  /**
    @type L.Map
   */
  leafletMap: null,

  /**
    Array of results for display
   */
  results: null,

  hasData: false,

  hasError: false,

  resultObserver: Ember.observer('results', function () {
    this.send('selectFeature', null);
    this.set('showLoader', true);
    this.set('hasError', false);

    let results = this.get('results') || [];

    let promises = results.map((result) => { return result.features; });

    Ember.RSVP.all(promises).then(
      (features) => {
        let featuresCount = features.reduce((sum, feature) => { return sum + feature.length; }, 0);
        this.set('hasData', featuresCount > 0);
      },
      (error) => {
        this.set('hasData', true);
        this.set('hasError', true);
      }
    ).finally(() => {
      this.set('showLoader', false);
    });
  })
});
