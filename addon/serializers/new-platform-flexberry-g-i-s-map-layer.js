/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as MapLayerSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-layer';

/**
  Map layer serializer.

  @class NewPlatformFlexberryGISMapLayerSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapLayerSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(MapLayerSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
