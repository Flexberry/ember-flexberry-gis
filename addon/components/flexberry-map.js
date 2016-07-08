import Ember from 'ember';
import layout from '../templates/components/flexberry-map';
import ContainerMixin from 'ember-flexberry-gis/mixins/layercontainer';

export default Ember.Component.extend(ContainerMixin, {
  layout,

  model: undefined,

  center: Ember.computed('model.lat', 'model.lng', function () {
    return L.latLng(this.get('model.lat') || 0, this.get('model.lng') || 0);
  }),

  zoom: Ember.computed('model.zoom', function() {
    return this.get('model.zoom');
  }),

  leafletMap: undefined,

  didInsertElement() {
    this._super(...arguments);
    let map = L.map(this.element, this.get('options'));
    map.setView(this.get('center'), this.get('zoom'));
    this.set('leafletMap', map);
    this.buildLayers(map);
    this.setOrder({ index: 0 });
  },

  willDestoryElement() {
    var leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.remove();
      this.set('leafletMap', null);
    }
  }
});
