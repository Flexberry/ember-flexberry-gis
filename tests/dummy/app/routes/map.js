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
  actions: {
    willTransition(transition) {
      this.controller.toggleProperty('showSpinner');
      if (this.controller.get('showSpinner')) {
        transition.abort();
        Ember.run.later(() => {
          transition.retry();
        });
      } else {
        return true;
      }
    }
  }
});
