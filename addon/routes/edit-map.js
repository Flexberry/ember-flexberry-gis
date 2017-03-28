/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import {
  Query
} from 'ember-flexberry-data';

/**
  Edit map route.
  Loads map project & related layers hierarchy.

  @class MapRoute
  @extends EditFormRoute
*/
export default EditFormRoute.extend({
  queryParams: {
    setting: {
      refreshModel: false,
      replace: false,
      as: 'setting'
    },
    geofilter: {
      refreshModel: false,
      replace: false,
      as: 'geofilter'
    }
  },

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  modelName: 'new-platform-flexberry-g-i-s-map',

  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'Map'
  */
  modelProjection: 'Map',

  /**
    Name of model to be used for layer loading.

    @property layerModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map-layer'
  */
  layerModelName: 'new-platform-flexberry-g-i-s-map-layer',

  /**
    Name of model projection to be used as layers's properties limitation.

    @property layerModelProjection
    @type String
    @default 'MapLayer'
  */
  layerModelProjection: 'MapLayer',

  model() {
    let model = this._super(...arguments);
    return model.then((map) => {
      let store = this.get('store');
      let layerModelName = this.get('layerModelName');

      let query = new Query.Builder(store)
        .from(layerModelName)
        .selectByProjection(this.get('layerModelProjection'))
        .where('map', Query.FilterOperator.Eq, map.get('id'));

      return store.query(layerModelName, query.build()).then((layers) => {
        map.set('mapLayer', layers);
        return model;
      });
    });
  },

  /**
    Setups controller for the current route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

    @method setupController
    @param {Ember.Controller} controller
    @param {Object} model
  */
  setupController(controller, model) {
    this._super(...arguments);
    let layers = model.get('mapLayer').filter(layer => Ember.isEmpty(layer.get('parent')));

    if (layers) {
      model.set('hierarchy', this.sortLayersByIndex(layers));
    }
  },

  sortLayersByIndex(layers) {
    let result = layers;
    if (result) {
      result = result.sortBy('index').reverse();
      result.forEach((item) => {
        if (Ember.isArray(item.get('layers'))) {
          item.set('layers', this.sortLayersByIndex(item.get('layers')));
        }
      }, this);
    }

    return result;
  }
});
