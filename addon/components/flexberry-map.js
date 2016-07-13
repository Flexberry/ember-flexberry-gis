import Ember from 'ember';
import layout from '../templates/components/flexberry-map';

export default Ember.Component.extend({
  layout,

  model: undefined,

  mapElement: undefined,

  center: Ember.computed('model.lat', 'model.lng', function () {
    return L.latLng(this.get('model.lat') || 0, this.get('model.lng') || 0);
  }),

  zoom: Ember.computed('model.zoom', function() {
    return this.get('model.zoom');
  }),

  leafletMap: undefined,

  layers: [],

  init() {
    this._super(...arguments);
    let mapElement = Ember.$("<div>")[0];
    this.set('mapElement', mapElement);
    let map = L.map(mapElement);
    this.set('leafletMap', map);
  },

  didInsertElement() {
    this._super(...arguments);
    this.$().append(this.get('mapElement'));
    let map = this.get('leafletMap');
    map.setView(this.get('center'), this.get('zoom'));
  },

  willDestoryElement() {
    var leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.remove();
      this.set('leafletMap', null);
    }
  }
});
