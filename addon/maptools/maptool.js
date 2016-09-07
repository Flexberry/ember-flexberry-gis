import Ember from 'ember';

export default Ember.Object.extend({
  cursor: '',

  map: null,

  isMultiTool() {
    return false;
  },

  enable() {
    let element = this.get('map')._container;
    let cursor = this.get('cursor');
    if(element && cursor && !L.DomUtil.hasClass(element, cursor)) {
      L.DomUtil.addClass(element, cursor);
    }
  },

  disable() {
    let element = this.get('map')._container;
    let cursor = this.get('cursor');
    if(element && cursor && L.DomUtil.hasClass(element, cursor)) {
      L.DomUtil.removeClass(element, cursor);
    }
  }

});
