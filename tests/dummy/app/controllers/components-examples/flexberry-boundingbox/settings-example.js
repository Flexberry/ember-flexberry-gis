import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    onBoundingBoxChange(e) {
      console.log('boundingBoxChange: ', e);

      this.set('minLatFromAction', e._southWest.lat);
      this.set('maxLatFromAction', e._northEast.lat);
      this.set('minLngFromAction', e._southWest.lng);
      this.set('maxLngFromAction', e._northEast.lng);
    }
  }
});
