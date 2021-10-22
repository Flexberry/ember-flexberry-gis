/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import { Serializer as MapLayerSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-layer';

/**
  Map layer serializer.

  @class NewPlatformFlexberryGISMapLayerSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISMapLayerSerializerMixin
*/
export default OdataSerializer.extend(MapLayerSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey',
});
