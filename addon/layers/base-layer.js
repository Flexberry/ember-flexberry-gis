import Ember from 'ember';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

const { assert } = Ember;

export default Ember.Object.extend(LeafletOptionsMixin, {

  model: undefined,

  container: undefined,

  leafletLayer: undefined,

  order: undefined,

  toggleVisible: function () {
    if (this.get('model.visibility')) {
      this.get('container').addLayer(this.get('leafletLayer'));
    }
    else {
      this.get('container').removeLayer(this.get('leafletLayer'));
    }
  },

  createLayer() {
    assert('BaseLayer\'s `createLayer` should be overriden.');
  },

  buildLayer(container, model) {
    assert('Should be built with container', container);
    assert('Should be built with layer', model);

    this.set('model', model);
    this.set('container', container);
    this.set('leafletLayer', this.createLayer());
    this.addObserver('model.visibility', this.toggleVisible);
    this.toggleVisible();
  },

  setOrder(indexed) {
    let leafLayer = this.get('leafletLayer');
    if (leafLayer && leafLayer.setZIndex) {
      leafLayer.setZIndex(indexed.index);
      this.set('order', indexed.index);
      indexed.index++;
    }
  }
});
