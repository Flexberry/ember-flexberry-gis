/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as MapObjectSettingSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-object-setting';

/**
  Map object setting serializer.

  @class NewPlatformFlexberryGISMapObjectSettingSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapObjectSettingSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(MapObjectSettingSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
