/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';
import { OfflineSerializer as LayerMetadataSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-layer-metadata-offline';

/**
  Layer metadata offline serializer.

  @class NewPlatformFlexberryGISLayerLayerMetadataOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLayerMetadataOfflineSerializerMixin
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, LayerMetadataSerializer, {
});
