/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

/**
  Mixin containing logic that loads map layers hierarchy.

  @class MapLayersLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>.
*/
export default Ember.Mixin.create({
  /**
    Name of model to be used as map's layer type.

    @property layerModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map-layer'
  */
  layerModelName: 'new-platform-flexberry-g-i-s-map-layer',

  /**
    Loads given map layer.

    @method _loadLayer
    @param {Object} Loading layer metadata.
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise, which will return loaded layer after resolve.
    @private
  */
  _loadLayer(layer) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (layer.get('type') === 'group') {
        this._loadChildLayers(layer)
          .then(layers => layer.set('layers', Ember.A(layers)))
          .then(() => resolve(layer))
          .catch(reason => reject(reason));
      } else {
        resolve(layer);

        // load LayerLinks
        let layerLinkModelName = 'new-platform-flexberry-g-i-s-layer-link';
        let layerLinkProjection = 'LayerLinkI';

        let query =
          new Query.Builder(this.store)
            .from(layerLinkModelName)
            .selectByProjection(layerLinkProjection)
            .where('layer', Query.FilterOperator.Eq, layer.get('id'));

        return this.store
          .query(layerLinkModelName, query.build())
          .then(layerLinks => {
            layer.set('layerLinks', layerLinks);
          });
      }
    });
  },

  /**
    Loads nested child layers for given map layer.

    @method _loadChildLayers
    @param {Object} Loading layer metadata.
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise, which will return loaded child layers after resolve.
    @private
  */
  _loadChildLayers(layer) {
    let layerModelName = this.get('layerModelName');

    let query =
      new Query.Builder(this.store)
        .from(layerModelName)
        .selectByProjection('MapLayerE')
        .where('parent', Query.FilterOperator.Eq, layer.id);

    return this.store
      .query(layerModelName, query.build())
      .then(queryLayers => {
        let promises = queryLayers.map(lyr => this._loadLayer(lyr));
        return Ember.RSVP.Promise.all(promises);
      });
  },

  /**
    Loads nested layers hierarchy for a given map project.

    @method loadMapLayers
    @param {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise, which will return loaded map project after resolve.
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise, which will return loaded layers hierarchy (root layer wit nested child layers) after resolve.
  */
  loadMapLayers(mapPromise) {
    let baseModel = null;
    return mapPromise.then(map => {
      baseModel = map;
      return this._loadChildLayers(map.get('rootLayer'));
    }).then(layers => {
      baseModel.set('rootLayer.layers', Ember.A(layers));
      return mapPromise;
    });
  }
});
