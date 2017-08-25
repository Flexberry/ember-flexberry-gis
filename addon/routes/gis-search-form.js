import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

export default Ember.Route.extend({
  _metadatas: [],
  _maps: [],

  model() {
    return { metadata: this._metadatas, maps: this._maps };
  },

  //setupController
  actions: {
    loadData(keyWords) {
      let that = this;

      let b1 = new Query.Builder(this.store)
        .from('new-platform-flexberry-g-i-s-layer-metadata')
        .selectByProjection('LayerMetadataL');
      let getMetadata = this.store.query('new-platform-flexberry-g-i-s-layer-metadata', b1.build());

      let b2 = new Query.Builder(this.store)
        .from('new-platform-flexberry-g-i-s-map')
        .selectByProjection('AuditView');
      let getMaps = this.store.query('new-platform-flexberry-g-i-s-map', b2.build());

      Ember.RSVP.all([getMetadata, getMaps]).then((data) => {
        that._metadatas = data[0];
        that._maps = data[1];
        that.refresh();
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    }
  }
});
