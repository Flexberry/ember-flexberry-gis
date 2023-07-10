/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as MapLayerSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-layer-offline';
import __ApplicationSerializer from './application-offline';

/**
  Map layer offline serializer.
  @class NewPlatformFlexberryGISMapLayerOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISMapLayerOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(MapLayerSerializer, {
});
