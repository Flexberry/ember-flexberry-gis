import Ember from 'ember';

import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

export default Ember.Component.extend(LeafletOptionsMixin, {
  tagName: '',

  container: null,

  createControl() {
  },

  initControl: Ember.observer('container', function() {
    let leafletMap = this.get('container');
    if (leafletMap) {
      let control = this.createControl();
      this.set('control', control);
      control.addTo(this.get('container'));
    }
  }),

  didInsertElement() {
    this.initControl();
  }
});
