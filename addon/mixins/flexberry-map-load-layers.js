/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import QueryBuilder from 'ember-flexberry-data/query/builder';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';

/**
  Mixin for recursive load map layers from store
  @class FlexberryMapLoadLayers
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({

  /**
    @return {Ember.RSVP.Promise} Promise with loading flexberry-map-layer
    @private
   */
  _loadLayer(layer) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (layer.get('type') === 'group') {
        this._loadChildLayers(layer)
          .then(layers => layer.set('layers', layers))
          .then(() => resolve(layer))
          .catch(reason => reject(reason));
      }
      else {
        resolve(layer);
      }
    });
  },

  /**
    Load child layers of passed layer
    @return Array of loading layers promises
    @private
   */
  _loadChildLayers(layer) {
    let queryModel = 'new-platform-flexberry-g-i-s-map-layer';

    let query =
      new QueryBuilder(this.store)
        .from(queryModel)
        .selectByProjection('MapLayerE')
        .where('parent', FilterOperator.Eq, layer.id);

    return this.store
      .query(queryModel, query.build())
      .then(queryLayers => {
        let promises = queryLayers.map(lyr => this._loadLayer(lyr));
        return Ember.RSVP.Promise.all(promises);
      });
  },


  /**
    Set Index for each layer in hierarhy
    TODO: should be controlled by layers tree view and been stored in data
    @private
   */
  _setIndex(layers, indexed) {
    if (layers) {
      layers.forEach(layer => {
        layer.set('index', indexed.index);
        indexed.index++;
        this._setIndex(layer.get('layers'), indexed);
      });
    }
  },

  /**
    Load layer hierarhy of specified flexberry-map model
    @method loadMapLayers
   */
  loadMapLayers(mapPromise) {
    let baseModel = null;
    return mapPromise.then(map => {
      baseModel = map;
      return this._loadChildLayers(map.get('rootLayer'));
    }).then(layers => {
      baseModel.set('layers', layers);
      this._setIndex(layers, { index: 0 });
      return mapPromise;
    });
  }
});
