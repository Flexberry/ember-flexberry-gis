import Ember from 'ember';
import layout from '../templates/components/simple-map';
import FlexberryMapActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-map-actions-handler';
import LayerResultListActionHandlerMixin from 'ember-flexberry-gis/mixins/layer-result-list-actions-handler';

/**
  Simple map component contains map and search panel.
 */
export default Ember.Component.extend(
  FlexberryMapActionsHandlerMixin,
  LayerResultListActionHandlerMixin,
  {
    layout,

    leafletMap: null,

    serviceLayer: null,

    lat: null,

    lng: null,

    zoom: null,

    actions: {
      querySearch(queryString) {
        let leafletMap = this.get('leafletMap');
        let e = {
          latlng: leafletMap.getCenter(),
          searchOptions: {
            queryString,
            maxResultsCount: 10
          },
          filter() { return true; },
          results: Ember.A()
        };

        leafletMap.fire('flexberry-map:search', e);

        this.set('searchResults', e.results);
      },

      clearSearch() {
        this.set('searchResults', null);
      },

      clearIdentification() {
        this.set('identifyResults', null);
      }
    },

    mapObserver: Ember.on('init', Ember.observer('leafletMap', function () {
      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {
        leafletMap.on('flexberry-map:identificationFinished', this._idenficationFinished, this);
      }
    })),

    _idenficationFinished(e) {
      let serviceLayer = this.get('serviceLayer');
      serviceLayer.clearLayers();
      this.set('identifyResults', e.results);
    }
  });
