/**
  @module ember-flexberry-gis-dummy
*/

import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import EditFormRouteOperationsIndicationMixin from '../mixins/edit-form-route-operations-indication';
import MapRouteCswLoaderMixin from 'ember-flexberry-gis/mixins/map-route-csw-loader';

/**
  Map edit route.

  @class MapRoute
  @extends EditMapRoute
  @uses EditFormRouteOperationsIndicationMixin, MapRouteCswLoaderMixin
*/
export default EditMapRoute.extend(
  EditFormRouteOperationsIndicationMixin,
  MapRouteCswLoaderMixin, {
});
