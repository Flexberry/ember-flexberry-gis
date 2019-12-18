import Ember from 'ember';
import layout from '../templates/components/favorites-list';

export default Ember.Component.extend({
  layout,
  store: Ember.inject.service(),
  favItems: [],
  features: [1,2,3],
  testing: [1,2,3],
  test: 'test',
  onFavItemsChange: Ember.observer('favItems', () => {
    console.log(this.get('favItems'));
  }),
  // init() {
  //   this._super(...arguments);
  //   let layers = this.get('store').peekAll('new-platform-flexberry-g-i-s-map-layer');
  //   console.log(layers);
  // },
  actions: {
    clickme() {
      console.log(this.get('features'));
      let map = this.get('leafletMap')
      let l = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors'
      }).addTo(map);
      setTimeout(()=>{
        map.removeLayer(l);
      }, 1000)
    }
  }
});
