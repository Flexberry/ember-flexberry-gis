import Ember from 'ember';
import layout from '../templates/components/favorites-list';

export default Ember.Component.extend({
  layout,
  store: Ember.inject.service(),
  results: [],
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
    }
  }
});
