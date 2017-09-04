/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';
import { OfflineSerializer as LinkMetadataSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-metadata-offline';

/**
  Link metadata offline serializer.

  @class NewPlatformFlexberryGISLinkMetadataOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLinkMetadataOfflineSerializerMixin
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, LinkMetadataSerializer, {
});
