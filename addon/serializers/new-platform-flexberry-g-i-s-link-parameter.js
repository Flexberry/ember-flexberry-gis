/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import {
  Serializer as LinkParameterSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-parameter';

/**
  Link parameter serializer.

  @class NewPlatformFlexberryGISLinkParameterSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLinkParameterSerializerMixin
*/
export default OdataSerializer.extend(LinkParameterSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
