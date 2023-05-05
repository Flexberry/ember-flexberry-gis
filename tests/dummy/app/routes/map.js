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

  setupController: function setupController(controller, model) {
    this._super(...arguments);
    controller.set('access', this.get('access'));
  },

  actions: {
    willTransition(transition) {
      this.controller.toggleProperty('showSpinner');
      if (this.controller.get('showSpinner')) {
        transition.abort();
        Ember.run.later(() => {
          transition.retry();
        });
      }
      else {
        return true;
      }
    }
  }
});
