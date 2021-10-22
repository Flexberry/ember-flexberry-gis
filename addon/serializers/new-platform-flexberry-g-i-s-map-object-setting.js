/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import {
  Serializer as MapObjectSettingSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-object-setting';

/**
  Map object setting serializer.

  @class NewPlatformFlexberryGISMapObjectSettingSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapObjectSettingSerializerMixin
*/
export default OdataSerializer.extend(MapObjectSettingSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey',
});
