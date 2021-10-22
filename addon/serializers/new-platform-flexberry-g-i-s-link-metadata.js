/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import {
  Serializer as LinkMetadataSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-metadata';

/**
  Link metadata serializer.

  @class NewPlatformFlexberryGISLinkMetadataSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLinkMetadataSerializerMixin
*/
export default OdataSerializer.extend(LinkMetadataSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey',
});
