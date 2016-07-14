import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import LeafletRequiredOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-required-options';
import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';

const { assert } = Ember;

export default Ember.Component.extend(
  DynamicPropertiesMixin,
  LeafletOptionsMixin,
  LeafletRequiredOptionsMixin,
  LeafletPropertiesMixin,
  {
    tagName: '',

    model: undefined,

    container: undefined,

    index: Ember.computed('model.index', function () {
      return this.get('model.index');
    }),

    dynamicProperties: Ember.computed('model.settingsAsObject', function () {
      return this.get('model.settingsAsObject');
    }),

    setZIndex: Ember.observer('index', function () {
      let layer = this.get('_layer');
      if (layer && layer.setZIndex) {
        layer.setZIndex(this.get('index'));
      }
    }),

    _layer: undefined,

    visibility: Ember.computed('model.visibility', function() {
      return this.get('model.visibility');
    }),

    toggleVisible: Ember.observer('visibility', function () {
      Ember.assert('Try to change layer visibility without container', this.get('container'));
      if (this.get('visibility')) {
        this.get('container').addLayer(this.get('_layer'));
      }
      else {
        this.get('container').removeLayer(this.get('_layer'));
      }
    }),

    createLayer() {
      assert('BaseLayer\'s `createLayer` should be overriden.');
    },

    init() {
      this._super(...arguments);
      this.set('_layer', this.createLayer());
      this._addObservers();
    },

    didInsertElement() {
      this._super(...arguments);
      this.toggleVisible();
      this.setZIndex();
    }
  });
