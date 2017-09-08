/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';
import { OfflineSerializer as LayerLinkSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-link-offline';

/**
  Layer link offline serializer.

  @class NewPlatformFlexberryGISLayerLinkOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLayerLinkOfflineSerializerMixin
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, LayerLinkSerializer, {
});
