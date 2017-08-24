import Ember from 'ember';

export default Ember.Controller.extend({
    keyWords: "",
    scale: "",
    minLng: "",
    minLat: "",
    maxLng: "",
    maxLat: "",
    actions: {
        getSearchResults() {
            this.send('loadData', this.keyWords);
        }
    }
});
