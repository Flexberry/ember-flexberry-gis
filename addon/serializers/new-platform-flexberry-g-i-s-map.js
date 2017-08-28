/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as MapSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map';

/**
  Map serializer.

  @class NewPlatformFlexberryGISMapSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(MapSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
