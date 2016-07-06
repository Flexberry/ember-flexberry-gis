import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import QueryBuilder from 'ember-flexberry-data/query/builder';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';

export default EditFormRoute.extend({
  modelProjection: 'MapE',
  modelName: 'new-platform-flexberry-g-i-s-map',

  loadLayer(layer) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if(layer.get('type') === 'group') {
        this.loadChildLayers(layer)
        .then(layers => layer.set('layers', layers))
        .then(() => resolve(layer))
        .catch(reason => reject(reason));
      }
      else
      {
        resolve(layer);
      }
    });
  },

  loadChildLayers(layer) {
      let queryModel = 'new-platform-flexberry-g-i-s-map-layer';

      let query =
        new QueryBuilder(this.store)
          .from(queryModel)
          .selectByProjection('MapLayerE')
          .where('parent', FilterOperator.Eq, layer.id);

      return this.store
        .query(queryModel, query.build())
        .then(queryLayers => {
          let promises = queryLayers.map(lyr => this.loadLayer(lyr));
          return Ember.RSVP.Promise.all(promises);
        });
  },

  model() {
    let baseModel = null;
    return this._super(...arguments).then(map => {
      baseModel = map;
      return this.loadChildLayers(map.get('rootLayer'));
    }).then(layers => {
      baseModel.set('layers', layers);
      return baseModel;
    });
  }
});
