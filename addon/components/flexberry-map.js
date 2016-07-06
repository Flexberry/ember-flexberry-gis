import Ember from 'ember';
import layout from '../templates/components/flexberry-map';
import ContainerMixin from 'ember-flexberry-gis/mixins/layercontainer';

export default Ember.Component.extend(ContainerMixin, {
  layout,

  model: undefined,

  leafletMap: undefined,

  didInsertElement() {
    this._super(...arguments);
    let map = L.map(this.element, this.get('options'));
    map.setView([0, 0], 2);
    this.set('leafletMap', map);
    this.buildLayers(map, this.get('model'));
  },

  willDestoryElement() {
    var leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.remove();
      this.set('leafletMap', null);
    }
  }
});
