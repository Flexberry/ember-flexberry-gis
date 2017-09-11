/**
  @module ember-flexberry-gis
*/

import FlexberryData from 'ember-flexberry-data';
import { Serializer as LayerLinkSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-link';

/**
  Layer link serializer.

  @class NewPlatformFlexberryGISLayerLinkSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISLayerLinkSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(LayerLinkSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
