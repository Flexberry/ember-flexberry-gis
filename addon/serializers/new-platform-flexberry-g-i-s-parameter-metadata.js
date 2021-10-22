/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import {
  Serializer as ParameterMetadataSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-parameter-metadata';

/**
  Parameter metadata serializer.

  @class NewPlatformFlexberryGISParameterMetadataSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISParameterMetadataSerializerMixin
*/
export default OdataSerializer.extend(ParameterMetadataSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey',
});
