import { Serializer as BackgroundLayerSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-background-layer';
import __ApplicationSerializer from './application';

export default __ApplicationSerializer.extend(BackgroundLayerSerializer, {
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
