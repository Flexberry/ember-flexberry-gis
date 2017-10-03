/**
  @module ember-flexberry-gis-dummy
*/

import EditFormNewRoute from 'ember-flexberry/routes/edit-form-new';
import EditFormRouteOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-route-operations-indication';

/**
  New map edit route.

  @class NewNewPlatformFlexberryGISLayerMetadataERoute
  @extends EditFormNewRoute
  @uses EditFormRouteOperationsIndicationMixin
*/
export default EditFormNewRoute.extend(EditFormRouteOperationsIndicationMixin, {
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
  modelName: 'new-platform-flexberry-g-i-s-layer-metadata',

  /**
    Name of template to be rendered.

    @property templateName
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata-e'
  */
  templateName: 'new-platform-flexberry-g-i-s-layer-metadata-e'
});
