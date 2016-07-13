import Ember from 'ember';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';
import LeafletEventsMixin from 'ember-flexberry-gis/mixins/leaflet-events';

import layout from '../templates/components/flexberry-map';

export default Ember.Component.extend(
  LeafletOptionsMixin,
  LeafletPropertiesMixin,
  LeafletEventsMixin,
  {
    layout,

    model: undefined,

    mapElement: undefined,

    leafletEvents: ['moveend'],

    leafletOptions: ['zoomControl'],

    leafletProperties: ['zoom:setZoom', 'center:panTo:zoomPanOptions', 'maxBounds:setMaxBounds', 'bounds:fitBounds:fitBoundsOptions'],

    center: Ember.computed('model.lat', 'model.lng', function () {
      return L.latLng(this.get('model.lat') || 0, this.get('model.lng') || 0);
    }),

    zoom: Ember.computed('model.zoom', function () {
      return this.get('model.zoom');
    }),

    _layer: undefined,

    layers: [],

    init() {
      this._super(...arguments);
      let mapElement = Ember.$("<div>")[0];
      this.set('mapElement', mapElement);
      let map = L.map(mapElement, this.get('options'));
      this.set('_layer', map);
      this._addObservers();
      this._addEventListeners();
    },

    didInsertElement() {
      this._super(...arguments);
      this.$().append(this.get('mapElement'));
      let map = this.get('_layer');
      map.setView(this.get('center'), this.get('zoom'));
    },

    willDestoryElement() {
      var leafletMap = this.get('_layer');
      if (leafletMap) {
        leafletMap.remove();
        this.set('_layer', null);
      }
    }
  });
