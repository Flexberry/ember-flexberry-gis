/**
  @module ember-flexberry-gis-dummy
*/

import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import EditFormRouteOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-route-operations-indication';

/**
  Map edit route.

  @class MapRoute
  @extends EditMapRoute
  @uses EditFormRouteOperationsIndicationMixin, MapRouteCswLoaderMixin
*/
export default EditMapRoute.extend(EditFormRouteOperationsIndicationMixin, {
  access: null,

  afterModel(model) {
    this.set('access.mapLayerModel', model.get('mapLayer').map((r) => r.id));
    this.set('access.mapLayerData', model.get('mapLayer').map((r) => r.id));

    this._super(...arguments);
  },

  init() {
    this._super(...arguments);
    this.access = this.access || {
      map: true,
      mapLayerModel: [],
      mapLayerData: [],
    };
  },
});
