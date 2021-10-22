/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import OfflineSerializer from 'ember-flexberry-data/serializers/offline';
import {
  OfflineSerializer as LayerLinkSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-link-offline';

/**
  Layer link offline serializer.

  @class NewPlatformFlexberryGISLayerLinkOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLayerLinkOfflineSerializerMixin
*/
export default OfflineSerializer.extend(DS.EmbeddedRecordsMixin, LayerLinkSerializer, {
});
