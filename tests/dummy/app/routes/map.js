/**
  @module ember-flexberry-gis-dummy
*/

import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import EditFormRouteOperationsIndicationMixin from '../mixins/edit-form-route-operations-indication';

/**
  Map route.

  @class MapRoute
  @extends EditMapRoute
  @uses EditFormRouteOperationsIndicationMixin
*/
export default EditMapRoute.extend(
  EditFormRouteOperationsIndicationMixin, {
});
