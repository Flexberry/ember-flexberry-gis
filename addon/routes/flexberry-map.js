import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import QueryBuilder from 'ember-flexberry-data/query/builder';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';

export default EditFormRoute.extend({
  modelProjection: 'MapE',
  modelName: 'new-platform-flexberry-g-i-s-map',

  loadChildLayers(layer) {
    let that = this;
    return new Ember.RSVP.Promise((resolve, reject) => {

      let queryModel = 'new-platform-flexberry-g-i-s-map-layer';

      let query =
        new QueryBuilder(that.store)
          .from(queryModel)
          .selectByProjection('MapLayerE')
          .where('parent', FilterOperator.Eq, layer.id);

      let promises = [];
      let childs = [];

      that.store
        .query(queryModel, query.build())
        .then(queryLayers => {

          queryLayers.forEach(child => {

            if (child.get('type') === 'group') {
              let childPromise = that.loadChildLayers(child);
              promises.push(childPromise);
              childPromise.then(layers => child.set('layers', layers));
            }

            childs.push(child);
          });
        })
        .catch(ex => reject(ex));

      Ember.RSVP.Promise.all(promises).then(resolve(childs));
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
