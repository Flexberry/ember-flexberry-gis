/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import {
  Serializer as LayerMetadataSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-metadata';

/**
  Layer metadata serializer.

  @class NewPlatformFlexberryGISLayerMetadataSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLayerMetadataSerializerMixin
*/
export default OdataSerializer.extend(LayerMetadataSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey',
});
