import Ember from 'ember';

export default Ember.Controller.extend({
  keyWords: '',
  scale: '',
  minLng: '',
  minLat: '',
  maxLng: '',
  maxLat: '',
  actions: {
    getSearchResults() {
      this.send('loadData', this.keyWords);
    },
    getData(data) {
      let d = Ember.$().extend(data, {
        keyWords: this.keyWords
      });
      this.send('getDataExt', d);
    }
  }
});
