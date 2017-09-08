/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as ParameterMetadataSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-parameter-metadata';

/**
  Parameter metadata serializer.

  @class NewPlatformFlexberryGISParameterMetadataSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISParameterMetadataSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(ParameterMetadataSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
