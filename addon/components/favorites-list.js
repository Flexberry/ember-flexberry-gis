import Ember from 'ember';
import layout from '../templates/components/favorites-list';

export default Ember.Component.extend({
  layout,
  store: Ember.inject.service(),
  results: Ember.A([]),
  favItems: [],
  actions: {
    clickme() {
      console.log(this.get('favItems'));
      let f = this.get('favItems');
      console.log(f);
      let ar = []
      f.forEach(element => {
        ar.push(element);
      });
      this.set('results', ar)
      let test = Ember.A([]);
      let promise = new Ember.RSVP.Promise((resolve)=>{
        resolve(ar);
      })
      console.log(test);
      test[0] = {layerModel: ar[0].layerModel, features: promise}
      this.set('results', test)
    }
  }
});
