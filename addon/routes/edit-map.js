/**
  @module ember-flexberry-gis
*/

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
  model() {
    let mapPromise = this._super(...arguments);

    return this.loadMapLayers(mapPromise);
  }
});
