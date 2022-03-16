import FlexberryData from 'ember-flexberry-data';
import { Serializer as BackgroundLayerSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-background-layer';

/**
  Background layer serializer.

  @class NewPlatformFlexberryGISBackgroundLayerSerializer
  @extends OdataSerializer
  @uses NewPlatformFlexberryGISBackgroundLayerSerializerMixin
*/
export default FlexberryData.Serializer.Odata.extend(BackgroundLayerSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
