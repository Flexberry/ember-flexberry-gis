/**
  @module ember-flexberry-gis-dummy
*/

import EditFormRoute from 'ember-flexberry/routes/edit-form';
import EditFormRouteOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-route-operations-indication';

/**
  Maps layers metadata edit route.

  @class NewPlatformFlexberryGISLayerMetadataERoute
  @extends EditFormRoute
  @uses EditFormRouteOperationsIndicationMixin
*/
export default EditFormRoute.extend(EditFormRouteOperationsIndicationMixin, {
  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'LayerMetadataE'
  */
  modelProjection: 'LayerMetadataE',

  /**
    Name of model to be used as record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata'
  */
  modelName: 'new-platform-flexberry-g-i-s-layer-metadata'
});
