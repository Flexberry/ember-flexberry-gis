import Ember from 'ember';

export default Ember.Component.extend({

  willDestroyElement() {
    this._super(...arguments);
    //var controller = this.container.lookup('controller:map');
    //let controller = this.get('controller');
    //controller.leafletMap.off('containerResizeStart', this._leafletMapOnContainerResizeStart, this);
  }
});
