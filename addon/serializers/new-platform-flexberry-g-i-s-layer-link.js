/**
  @module ember-flexberry-gis
*/

import OdataSerializer from 'ember-flexberry-data/serializers/odata';
import { Serializer as LayerLinkSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-link';

/**
  Layer link serializer.

  @class NewPlatformFlexberryGISLayerLinkSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLayerLinkSerializerMixin
*/
export default OdataSerializer.extend(LayerLinkSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
