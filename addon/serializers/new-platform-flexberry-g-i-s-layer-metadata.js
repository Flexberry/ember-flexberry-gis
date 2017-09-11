/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as LayerMetadataSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-metadata';

/**
  Layer metadata serializer.

  @class NewPlatformFlexberryGISLayerMetadataSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLayerMetadataSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(LayerMetadataSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
