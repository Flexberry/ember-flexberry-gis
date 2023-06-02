/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as LinkMetadataSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-metadata-offline';
import __ApplicationSerializer from './application-offline';

/**
  Link metadata offline serializer.
  @class NewPlatformFlexberryGISLinkMetadataOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLinkMetadataOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(LinkMetadataSerializer, {
});
