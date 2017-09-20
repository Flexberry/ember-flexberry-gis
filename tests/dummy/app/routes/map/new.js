/**
  @module ember-flexberry-gis-dummy
*/

import EditMapNewRoute from 'ember-flexberry-gis/routes/edit-map-new';
import EditFormRouteOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-route-operations-indication';
import MapRouteMetadataIdsHandlerMixin from 'ember-flexberry-gis/mixins/map-route-metadata-ids-handler';

/**
  New map edit route.

  @class NewMapRoute
  @extends EditMapNewRoute
  @uses EditFormRouteOperationsIndicationMixin
*/
export default EditMapNewRoute.extend(EditFormRouteOperationsIndicationMixin, MapRouteMetadataIdsHandlerMixin, {
  /**
    Name of template to be rendered.

    @property templateName
    @type String
    @default 'map'
  */
  templateName: 'map'
});
