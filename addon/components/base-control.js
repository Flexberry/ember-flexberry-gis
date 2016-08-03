import Ember from 'ember';

import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

export default Ember.Component.extend(LeafletOptionsMixin, {
  tagName: '',

  map: null,

  createControl() {
  },

  initControl: Ember.observer('map', function() {
    let leafletMap = this.get('map');
    if (!Ember.isNone(leafletMap)) {
      let control = this.createControl();
      this.set('control', control);
      control.addTo(leafletMap);
    }
  }),

  didInsertElement() {
    this.initControl();
  }
});
