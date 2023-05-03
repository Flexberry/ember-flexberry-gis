/**
  @module ember-flexberry-gis-dummy
*/

import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import Ember from 'ember';
import EditFormRouteOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-route-operations-indication';

/**
  Map edit route.

  @class MapRoute
  @extends EditMapRoute
  @uses EditFormRouteOperationsIndicationMixin, MapRouteCswLoaderMixin
*/
export default EditMapRoute.extend(EditFormRouteOperationsIndicationMixin, {
  access: {
    map: true,
    mapLayerModel: [],
    mapLayerData: [],
    presenceLayerInGeoportal: []
  },

  afterModel(model) {
    this.set('access.mapLayerModel', model.get('mapLayer').map((r) => { return r.id; }));
    this.set('access.mapLayerData', model.get('mapLayer').map((r) => { return r.id; }));

    this._super(...arguments);
  },

  actions: {
    willTransition(transition) {
        if (!this.controller.get("showSpinner")) {
        this.controller.set('showSpinner', true);
        transition.abort();
        Ember.run.later(() => {
          transition.retry();
        });
      }
      else {
        this.controller.set('showSpinner', false);
        return true;
      }
    }
  }
});
