/**
  @module ember-flexberry-gis-dummy
*/

import EditMapRoute from 'ember-flexberry-gis/routes/edit-map';
import EditFormRouteOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-route-operations-indication';
import MapRouteMetadataIdsHandlerMixin from 'ember-flexberry-gis/mixins/map-route-metadata-ids-handler';

/**
  Map edit route.

  @class MapRoute
  @extends EditMapRoute
  @uses EditFormRouteOperationsIndicationMixin, MapRouteCswLoaderMixin
*/
export default EditMapRoute.extend(EditFormRouteOperationsIndicationMixin, MapRouteMetadataIdsHandlerMixin, {
});
