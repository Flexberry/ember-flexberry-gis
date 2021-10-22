/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import { Serializer as MapSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map';

/**
  Map serializer.

  @class NewPlatformFlexberryGISMapSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapSerializerMixin
*/
export default OdataSerializer.extend(MapSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
