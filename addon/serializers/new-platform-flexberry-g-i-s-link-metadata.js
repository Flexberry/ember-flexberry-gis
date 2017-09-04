/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as LinkMetadataSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-metadata';

/**
  Link metadata serializer.

  @class NewPlatformFlexberryGISLinkMetadataSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLinkMetadataSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(LinkMetadataSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
