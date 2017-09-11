/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as LinkParameterSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-parameter';

/**
  Link parameter serializer.

  @class NewPlatformFlexberryGISLinkParameterSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLinkParameterSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(LinkParameterSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
