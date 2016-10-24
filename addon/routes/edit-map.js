/**
  @module ember-flexberry-gis
*/

import { Query } from 'ember-flexberry-data';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import MapLayersLoaderMixin from '../mixins/map-layers-loader';

/**
  Edit map route.
  Loads map project & related layers hierarchy.

  @class MapRoute
  @extends EditFormRoute
  @uses MapLayersLoaderMixin
*/
export default EditFormRoute.extend(MapLayersLoaderMixin, {
  queryParams: {
    setting: {
      refreshModel: false,
      replace: false,
      as: 'setting'
    },
    filter: {
      refreshModel: false,
      replace: false,
      as: 'filter'
    }
  },

  /**
    Name of model to be used for load LayerLinks by setting query parameters
   */
  layerLinkModelName: 'new-platform-flexberry-g-i-s-layer-link',

  /**
    Name of model projection to be used for load LayerLinks by setting query parameters
   */
  layerLinkProjection: 'LayerLinkD',

  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'MapE'
  */
  modelProjection: 'MapE',

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  modelName: 'new-platform-flexberry-g-i-s-map',

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a map project for current route.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {*} Model of map project for current route.
  */
  model(params) {
    let mapPromise = this._super(...arguments);

    let layerLinkModelName = this.get('layerLinkModelName');
    let query =
      new Query.Builder(this.store)
        .from(layerLinkModelName)
        .selectByProjection(this.get('layerLinkProjection'))
        .where('mapObjectSetting', Query.FilterOperator.Eq, params.setting || null);

    return this.store
      .query(layerLinkModelName, query.build())
      .then(layerLinks => {
        this.set('layerLinks', layerLinks);
        return;
      }).then(() => {
        return this.loadMapLayers(mapPromise);
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('layerLinks', this.get('layerLinks'));
  }
});
