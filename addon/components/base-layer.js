import Ember from 'ember';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

const { assert } = Ember;

export default Ember.Component.extend(LeafletOptionsMixin, {
  tagName: '',

  model: undefined,

  container: undefined,

  leafletLayer: undefined,

  order: undefined,

  toggleVisible: Ember.observer('model.visibility', 'leafletLayer', function () {
    Ember.assert('Try to change layer visibility without container', this.get('container'));
    if (this.get('leafletLayer')) {
      if (this.get('model.visibility')) {
        this.get('container').addLayer(this.get('leafletLayer'));
      }
      else {
        this.get('container').removeLayer(this.get('leafletLayer'));
      }
    }
  }),

  createLayer() {
    assert('BaseLayer\'s `createLayer` should be overriden.');
  },

  init() {
    this._super(...arguments);
    this.set('leafletLayer', this.createLayer());
  },

  didInsertElement() {
    this._super(...arguments);
    this.toggleVisible();
  }
});
