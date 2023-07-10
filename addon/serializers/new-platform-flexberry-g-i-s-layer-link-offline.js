/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as LayerLinkSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-link-offline';
import __ApplicationSerializer from './application-offline';

/**
  Layer link offline serializer.
  @class NewPlatformFlexberryGISLayerLinkOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLayerLinkOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(LayerLinkSerializer, {
});
