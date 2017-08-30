import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

export default Ember.Route.extend({
  _metadata: [],
  _metadataCount: 0,
  _maps: [],
  _mapsCount: 0,

  model() {
    return {
      metadata: this._metadata,
      metadataCount: this._metadataCount,
      // TODO: may be it's best to get that object from flexberry model, but it doesn't contain field order
      metadataHeader: { name: 'Название', type: 'Тип' },
      maps: this._maps,
      mapsCount: this._mapsCount,
      mapHeader: { name: 'Название', lat: 'Широта', lng: 'Долгота', zoom: 'Масштаб', public: 'Общая' }
    };
  },

  actions: {
    loadData(req) {
      let that = this;
      
      let b1 = new Query.Builder(this.store)
        .from('new-platform-flexberry-g-i-s-layer-metadata')
        .selectByProjection('LayerMetadataL')
        .count();
      let getMetadata = this.store.query('new-platform-flexberry-g-i-s-layer-metadata', b1.build());

      let b2 = new Query.Builder(this.store)
        .from('new-platform-flexberry-g-i-s-map')
        .selectByProjection('MapL')
        .count();
      let getMaps = this.store.query('new-platform-flexberry-g-i-s-map', b2.build());

      Ember.RSVP.all([getMetadata, getMaps]).then((data) => {
        that._metadata = data[0];
        that._metadataCount = data[0].meta.count;
        that._maps = data[1];
        that._mapsCount = data[1].meta.count;
        that.refresh();
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    },
    getDataExt(req) {
      let that = this;
      that.changingModel = req.modelName;
      let builder = new Query.Builder(this.store)
        .from(req.modelName)
        .selectByProjection(req.projectionName)
        .top(req.top)
        .skip(req.skip)
        .count();
      let query = this.store.query(req.modelName, builder.build());
      query.then((data) => {
        switch (that.changingModel) {
          case 'new-platform-flexberry-g-i-s-layer-metadata':
            that._metadata = data;
            that._metadataCount = data.meta.count;
          break;
          case 'new-platform-flexberry-g-i-s-map':
            that._maps = data;
            that._mapsCount = data.meta.count;
          break;
        }
        that.refresh();
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    }
  }
});
